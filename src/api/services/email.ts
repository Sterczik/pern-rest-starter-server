import * as nodemailer from 'nodemailer';
import { gmailUser, gmailPassword } from '../../config/variables';

export default nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: gmailUser,
    pass: gmailPassword
  }
})
