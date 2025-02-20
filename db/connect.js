import { connect } from 'mongoose';

// Connect DB
const connectDB = (url) => {
  return connect(url);
};

export default connectDB;
