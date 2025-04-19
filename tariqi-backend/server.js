const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/auth'); 
const rideRoutes = require('./routes/rides');
const generalRoutes = require('./routes/general');

dotenv.config();

const app = express();

app.use(cors()); 
app.use(express.json()); 
app.use('/api/auth', authRoutes);
app.use('/api', rideRoutes);
app.use('/api', generalRoutes);

connectDB();

app.get('/', (req, res) => {
  res.send('Tariqi backend is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
