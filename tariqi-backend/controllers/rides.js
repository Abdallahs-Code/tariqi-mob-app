const Ride = require('../models/ride');
const Driver = require('../models/driver');
const Client = require('../models/client');
const JoinRequest = require('../models/joinRequest');

const driverCreateRide = async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can create rides' });
    }

    const driver = await Driver.findById(req.user.id);
    
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    if (driver.inRide) {
      return res.status(400).json({ message: 'You are already in a ride' });
    }

    const { route, availableSeats, rideTime } = req.body;

    const newRide = new Ride({
      driver: req.user.id, 
      route,
      availableSeats,
      rideTime,
    });

    await newRide.save();

    driver.inRide = true;
    await driver.save();

    res.status(201).json({ message: 'Ride created successfully', ride: newRide });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const clientGetRides = async (req, res) => {
  try {
    if (req.user.role === 'driver') {
      return res.status(403).json({ message: 'Drivers cannot view rides' });
    }

    const { pickupLocation, dropoffLocation } = req.body; // i will use them later for ride matching

    const rides = await Ride.find();
    res.status(200).json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const clientRequestRide = async (req, res) => {
  try {
    if (req.user.role === 'driver') {
      return res.status(403).json({ message: 'Drivers cannot request rides' });
    }

    const rideId = req.params.rideId;
    const clientId = req.user.id;

    const ride = await Ride.findById(rideId);

    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.rejectedClients.includes(clientId)) {
      return res.status(400).json({ message: 'You have already been rejected for this ride' });
    }

    if (ride.passengersLeft.includes(clientId)) {
      return res.status(400).json({ message: 'You have already left this ride' });
    }

    if (ride.passengers.includes(clientId)) {
      return res.status(400).json({ message: 'You have already joined this ride' });
    }

    const client = await Client.findById(req.user.id);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (client.inRide) {
      return res.status(400).json({ message: 'You have already joined a ride' });
    }

    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: 'No seats available for this ride' });
    }

    const existingRequest = await JoinRequest.findOne({ ride: rideId, client: clientId });
    if (existingRequest) return res.status(400).json({ message: 'Join request already pending' });

    const request = new JoinRequest({
      ride: rideId,
      client: clientId,
    });

    await request.save();

    res.status(201).json({ message: 'Join request sent to driver', request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const driverGetPendingRequests = async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can view pending requests' });
    }

    const rideId = req.params.rideId;

    const pendingRequests = await JoinRequest.find({ 
      ride: rideId,
      status: 'pending'
    });

    res.status(200).json(pendingRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const driverRespondToRequest = async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can respond to join ride requests' });
    }

    const requestId = req.params.requestId;
    const { status } = req.body;

    if (!['accept', 'reject'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const joinRequest = await JoinRequest.findById(requestId).populate('ride');

    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    if (joinRequest.ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const ride = await Ride.findById(joinRequest.ride._id);

    if (status === 'accept') {
      if (ride.availableSeats <= 0) {
        return res.status(400).json({ message: 'No available seats' });
      }

      ride.passengers.push(joinRequest.client);
      ride.availableSeats -= 1;

      const client = await Client.findById(joinRequest.client);
      if (!client) return res.status(404).json({ message: 'Client not found' });

      client.inRide = true;
      await client.save();

      joinRequest.status = 'accepted';
    } else {
      ride.rejectedClients.push(joinRequest.client);
      joinRequest.status = 'rejected';
    }

    joinRequest.requestedAt = null;

    await ride.save();
    await joinRequest.save();

    res.status(200).json({ message: `Join request ${status}ed` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const clientGetRequestStatus = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can access this route' });
    }

    const requestId = req.params.requestId;

    const joinRequest = await JoinRequest.findById(requestId);

    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request has timed out' });
    }

    res.status(200).json({ status: joinRequest.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const clientEndRide = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can leave rides' });
    }

    const ride_id = req.params.rideId;
    const client = await Client.findById(req.user.id);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (!client.inRide) {
      return res.status(400).json({ message: 'You are not in a ride' });
    }

    const ride = await Ride.findById(ride_id);

    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    ride.passengers = ride.passengers.filter(passenger => passenger.toString() !== client._id.toString());
    ride.availableSeats += 1;

    ride.passengersLeft.push(req.user.id);

    client.inRide = false;

    await ride.save();
    await client.save();

    await JoinRequest.deleteMany({ ride: ride_id, client: client._id });

    res.status(200).json({ message: 'Left the ride successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const driverEndRide = async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can cancel rides' });
    }

    const ride_id = req.params.rideId;
    const driver = await Driver.findById(req.user.id);

    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    if (!driver.inRide) {
      return res.status(400).json({ message: 'You are not in a ride' });
    }

    const ride = await Ride.findById(ride_id);

    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    for (const passengerId of ride.passengers) {
      const passenger = await Client.findById(passengerId);
      if (passenger) {
        passenger.inRide = false;
        await passenger.save();
      }
    }

    driver.inRide = false;
    await driver.save();

    await JoinRequest.deleteMany({ ride: ride_id });

    await Ride.findByIdAndDelete(ride_id);

    res.status(200).json({ message: 'Ride ended successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  driverCreateRide,
  clientGetRides,
  clientRequestRide,
  driverGetPendingRequests,
  driverRespondToRequest,
  clientGetRequestStatus,
  clientEndRide,
  driverEndRide,
};
