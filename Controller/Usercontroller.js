var user=require('../Model/Usermodel')
const bcrypt = require('bcrypt');
const storage = require('node-persist');
const nodemailer = require("nodemailer");
var jwt = require('jsonwebtoken');
storage.init();


const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const SALT_ROUNDS = 10;

const transporter = nodemailer.createTransport({
    service: "catalina25@ethereal.email",
    auth: {
      user: "connie43@ethereal.email",
      pass: "SHA7X6aQqWuAykfdg5",
    },
  });

// exports.Signup=async (req,res)=>{
//     // var b_pass= await bcrypt.hash(req.body.password, 10);
//     // req.body.password=b_pass;

//     var data=await user.create(req.body);
//     console.log(data)
//     res.status(200).json({
//         status:"Success",
//         data
//     })
// }

exports.Signup = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
        req.body.password = hashedPassword;

        const data = await user.create(req.body);
        console.log(data);
        res.status(200).json({
            status: "Success",
            data
        });
    } catch (error) {
        res.status(500).json({
            status: "Failure",
            message: "An error occurred during signup.",
            error: error.message
        });
    }
};

exports.get_index=async(req,res)=>{
    var data=await user.find();
    res.status(200).json({
        status:'Success',
        data
    })
}



// exports.Login = async (req, res) => {
//     try {
//         // Find user by email
//         const existingUser = await user.findOne({ email: req.body.email});
//         console.log("password",password)
//         // If user does not exist, return an error
//         if (!existingUser.password) {
//             return res.status(404).json({
//                 status: "Failure",
//                 message: "User not found. Please sign up first."
//             });
//         }

//         // Compare the password with the hashed password in the database
//         // const isPasswordCorrect = await bcrypt.compare(req.body.password, existingUser.password);
        
//         // If the password is incorrect, return an error
//         if (!existingUser) {
//             return res.status(401).json({
//                 status: "Failure",
//                 message: "Invalid email or password."
//             });
//         }

//         // If the email and password are correct, login is successful
//         res.status(200).json({
//             status: "Success",
//             message: "Login successful",
//             data: existingUser
//         });
//     } catch (error) {
//         // Handle any errors that occur during the process
//         res.status(500).json({
//             status: "Failure",
//             message: "An error occurred while logging in",
//             error: error.message
//         });
//     }
// };


// exports.Login = async (req, res) => {
//     try {
//         // Find user by email
//         const existingUser = await user.findOne({ email: req.body.email });

//         // Check if the user exists
//         if (!existingUser) {
//             return res.status(404).json({
//                 status: "Failure",
//                 message: "User not found. Please sign up first."
//             });
//         }

//         // Check if the password matches
//         if (req.body.password !== existingUser.password) {
//             return res.status(401).json({
//                 status: "Failure",
//                 message: "Incorrect password. Please try again."
//             });
//         }

//         // Generate JWT token if login is successful
//         const token = jwt.sign(
//             { userId: existingUser._id, email: existingUser.email },
//             JWT_SECRET,
//             { expiresIn: '7d' } // Token expires in 7 day
//         );

//         // Send the token and user data in the response
//         res.status(200).json({
//             status: "Success",
//             message: "Login successful",
//             token: token,
//             data: existingUser
//         });
//     } catch (error) {
//         // Handle any errors that occur during the process
//         res.status(500).json({
//             status: "Failure",
//             message: "An error occurred while logging in",
//             error: error.message
//         });
//     }
// };

exports.Login = async (req, res) => {
    try {
        const existingUser = await user.findOne({ email: req.body.email });

        if (!existingUser) {
            return res.status(404).json({
                status: "Failure",
                message: "User not found. Please sign up first."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(req.body.password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: "Failure",
                message: "Incorrect password. Please try again."
            });
        }

        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            status: "Success",
            message: "Login successful",
            token: token,
            data: existingUser
        });
    } catch (error) {
        res.status(500).json({
            status: "Failure",
            message: "An error occurred while logging in",
            error: error.message
        });
    }
};

exports.sendotp = async (req, res, next) => {
    try {
      const { email } = req.body;
      const User = await user.findOne({ email });
      console.log("email",User)
  
      if (!User) {
        return res
          .status(404)
          .json({ message: "User with this email does not exist" });
      }
  
      // Generate OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit OTP
      const otpExpiration = new Date(Date.now() + 3600000); // OTP expires in 1 hour
  
      // Save OTP and expiration to user
      User.otp = otp;
      User.otpExpiration = otpExpiration;
      await User.save();
      console.log(`OTP for ${User.email}: ${otp}`); 
  
      // Send OTP via email
      const mailOptions = {
        from: '"vidhi 👻" <vidhisavaliya@gmail.com>',
        to: User.email,
        subject: "Password Reset OTP",
        html: `<p>Your OTP for password reset is ${otp}</p><p>This OTP is valid for 1 hour.</p>`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Error sending email: " + error.message });
        } else {
          return res.status(200).json({ message: "OTP sent to your email", otp }); // Include OTP in the response
        }
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "An error occurred: " + error.message });
    }
  };

  exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find the user by email
        const User = await user.findOne({ email });
        if (!User) {
            return res.status(404).json({ message: "User not found. Please sign up first." });
        }

        // Check if OTP matches
        if (User.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }
            
        // Check if OTP is expired
        if (User.otpExpiration < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // OTP is valid
        res.status(200).json({
            status: "Success",
            message: "OTP verified successfully."
        });

        // Optionally, clear the OTP and expiration after verification
        // User.otp = null;
        // User.otpExpiration = null;
        await User.save();

    } catch (error) {
        res.status(500).json({
            status: "Failure",
            message: "An error occurred during OTP verification.",
            error: error.message
        });
    }
};

// exports.changePassword = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const newpass= req.body.newPassword

//         // Find the user by email
//         const User = await user.findOne({ email });
//         if (!User) {
//             return res.status(404).json({
//                 status: "Failure",
//                 message: "User not found."
//             });
//         }

//         console.log("email:",User.email)
//         console.log("current:",password)
//         console.log("new:",newpass)
//         console.log("user",User)
//         // Verify the current password
//         if (User.password !== password) {
//             return res.status(401).json({
//                 status: "Failure",
//                 message: "Current password is incorrect."
//             });
            
//         }
//         console.log("req.body.password:",password)
//         console.log("newpass:",User.password)

//         // Update the user's password in the database
//         User.password = newpass;
//         await User.save();

//         res.status(200).json({
//             status: "Success",
//             message: "Password changed successfully."
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: "Failure",
//             message: "An error occurred while changing the password.",
//             error: error.message
//         });
//     }
// };

exports.changePassword = async (req, res) => {
    try {
        const { email, password, newPassword } = req.body;
        const User = await user.findOne({ email });

        if (!User) {
            return res.status(404).json({
                status: "Failure",
                message: "User not found."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, User.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: "Failure",
                message: "Current password is incorrect."
            });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        User.password = hashedNewPassword;
        await User.save();

        res.status(200).json({
            status: "Success",
            message: "Password changed successfully."
        });
    } catch (error) {
        res.status(500).json({
            status: "Failure",
            message: "An error occurred while changing the password.",
            error: error.message
        });
    }
};

// exports.resetPassword = async (req, res) => {
//     try {
//         const { email, newPassword, otp } = req.body;

//         // Find the user by email
//         const User = await user.findOne({ email });
//         if (!User) {
//             return res.status(404).json({
//                 status: "Failure",
//                 message: "User not found."
//             });
//         }

//         // Check if OTP matches
//         if (User.otp !== otp) {
//             return res.status(400).json({ 
//                 status: "Failure",
//                 message: "Invalid OTP. Please try again." 
//             });
//         }

//         // Check if OTP is expired
//         if (User.otpExpiration < new Date()) {
//             return res.status(400).json({ 
//                 status: "Failure",
//                 message: "OTP has expired. Please request a new one." 
//             });
//         }

//         // Reset the password
//         User.password = newPassword;
        
//         // Clear the OTP and expiration
//         User.otp = null;
//         User.otpExpiration = null;

//         await User.save();

//         res.status(200).json({
//             status: "Success",
//             message: "Password reset successfully."
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: "Failure",
//             message: "An error occurred during password reset.",
//             error: error.message
//         });
//     }
// };

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword, otp } = req.body;
        const User = await user.findOne({ email });

        if (!User) {
            return res.status(404).json({
                status: "Failure",
                message: "User not found."
            });
        }

        if (User.otp !== otp) {
            return res.status(400).json({
                status: "Failure",
                message: "Invalid OTP. Please try again."
            });
        }

        if (User.otpExpiration < new Date()) {
            return res.status(400).json({
                status: "Failure",
                message: "OTP has expired. Please request a new one."
            });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        User.password = hashedNewPassword;
        User.otp = null;
        User.otpExpiration = null;
        await User.save();

        res.status(200).json({
            status: "Success",
            message: "Password reset successfully."
        });
    } catch (error) {
        res.status(500).json({
            status: "Failure",
            message: "An error occurred during password reset.",
            error: error.message
        });
    }
};