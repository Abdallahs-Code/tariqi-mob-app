const Ride = require('../models/ride');
const JoinRequest = require('../models/joinRequest');

const createRide = async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can create rides' });
    }
    
    const { pickupLocation, dropoffLocation, availableSeats, rideTime } = req.body;

    const newRide = new Ride({
      driver: req.user.id, 
      pickupLocation,
      dropoffLocation,
      availableSeats,
      rideTime,
    });

    await newRide.save();
    res.status(201).json({ message: 'Ride created successfully', ride: newRide });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getRides = async (req, res) => {
  try {
    const rides = await Ride.find();
    res.status(200).json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const requestRide = async (req, res) => {
  try {
    if (req.user.role === 'driver') {
      return res.status(403).json({ message: 'Drivers cannot join rides' });
    }

    const rideId = req.params.rideId;
    const clientId = req.user.id;

    const ride = await Ride.findById(rideId);

    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    if (ride.rejectedClients.includes(clientId)) {
      return res.status(400).json({ message: 'You have already been rejected for this ride' });
    }

    if (ride.passengers.includes(clientId)) {
      return res.status(400).json({ message: 'You have already joined this ride' });
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

const respondToJoinRequest = async (req, res) => {
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
    }
    else {
      ride.rejectedClients.push(joinRequest.client);
    }

    await ride.save();

    await JoinRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: `Join request ${status}ed` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRide,
  getRides,
  requestRide,
  respondToJoinRequest,
};
