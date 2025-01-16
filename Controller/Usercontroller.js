var user=require('../Model/Usermodel')
var admin=require('../Model/Admin')
const bcrypt = require('bcrypt');
const storage = require('node-persist');
const nodemailer = require("nodemailer");
var jwt = require('jsonwebtoken');
const Admin = require('../Model/Admin');
storage.init();


const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const SALT_ROUNDS = 10;

// const transporter = nodemailer.createTransport({
//     service: "catalina25@ethereal.email",
//     auth: {
//       user: "connie43@ethereal.email",
//       pass: "SHA7X6aQqWuAykfdg5",
//     },
//   });

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vidhisavaliya017@gmail.com',
      pass: 'ppte fdci pvtg twvf'
    }
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

        const { name, email, password, ...rest } = req.body;

        const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
        req.body.password = hashedPassword;

        // const data = await user.create(req.body);

        let data;
        let isAdmin = false;
        if (name.includes("admin")) {
            // Example logic: Treat as admin if email contains 'admin'
            data = await admin.create({ name, email, password: hashedPassword });
            isAdmin = true;
        } else {
            // Treat as user by default
            data = await user.create({ name, email, password: hashedPassword });
        }
        console.log(data);
        res.status(200).json({
            status: "Success",
            isAdmin,
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

exports.Login = async (req, res) => {
    try {
        // Check if the email exists in the user collection
        let existingUser = await user.findOne({ email: req.body.email });
        let isAdmin = false;

        // If not found in the user collection, check the admin collection
        if (!existingUser) {
            existingUser = await admin.findOne({ email: req.body.email });
            isAdmin = true; // Flag as admin if found in the admin collection
        }

        // If no user or admin is found, return an error
        if (!existingUser) {
            return res.status(404).json({
                status: "Failure",
                message: "User not found. Please sign up first."
            });
        }

        // Verify the password
        const isPasswordCorrect = await bcrypt.compare(req.body.password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: "Failure",
                message: "Incorrect password. Please try again."
            });
        }

        // Generate a JWT token with the isAdmin flag
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email, isAdmin },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            status: "Success",
            message: "Login successful",
            token: token,
            isAdmin, // Return the admin flag
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

// exports.sendotp = async (req, res, next) => {
//     try {
<<<<<<< Updated upstream
//       const { email } = req.body;
//       const User = await user.findOne({ email });
//       console.log("email",User)
  
//       if (!User) {
//         return res
//           .status(404)
//           .json({ message: "User with this email does not exist" });
//       }
  
//       // Generate OTP
//       const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit OTP
//       const otpExpiration = new Date(Date.now() + 3600000); // OTP expires in 1 hour
  
//       // Save OTP and expiration to user
//       User.otp = otp;
//       User.otpExpiration = otpExpiration;
//       await User.save();
//       console.log(`OTP for ${User.email}: ${otp}`); 
  
//       // Send OTP via email
//     //   const mailOptions = {
//     //     from: '"vidhi 👻" <vidhisavaliya@gmail.com>',
//     //     to: User.email,
//     //     subject: "Password Reset OTP",
//     //     html: `<p>Your OTP for password reset is ${otp}</p><p>This OTP is valid for 1 hour.</p>`,
//     //   };
  
//     var mailOptions = {
//         from: 'vidhisavaliya017@gmail.com',
//         to: User.email,
//         subject: 'Sending Email using Node.js',
//         text: `Your OTP for password reset is ${otp}This OTP is valid for 1 hour.`,
//       };

//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           return res
//             .status(500)
//             .json({ message: "Error sending email: " + error.message });
//         } else {
//           return res.status(200).json({ message: "OTP sent to your email", otp }); // Include OTP in the response
//         }
//       });

   

//     // transporter.sendMail(mailOptions, function(error, info){
//     //     if (error) {
//     //       console.log(error);
//     //     } else {
//     //       console.log('Email sent: ' + info.response);
//     //     }
//     //   });
//     } catch (error) {
//       return res
//         .status(500)
//         .json({ message: "An error occurred: " + error.message });
//     }
//   };

exports.sendotp = async (req, res, next) => {
    try {
      const { email } = req.body;
  
      const User = await user.findOne({ email }); // Check if user exists in DB
      console.log("email", User);
  
      if (!User) {
        return res.status(404).json({ message: "User with this email does not exist" });
      }
  
      // Generate OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
      const otpExpiration = new Date(Date.now() + 3600000); // 1 hour expiration
  
      // Save OTP and expiration to user
      User.otp = otp;
      User.otpExpiration = otpExpiration;
      await User.save();
      console.log(`OTP for ${User.email}: ${otp}`);
  
      // Email options
      const mailOptions = {
        from: '"Vidhi 👻" <vidhisavaliya017@gmail.com>',
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is ${otp}. This OTP is valid for 1 hour.`,
        html: `<p>Your OTP for password reset is <b>${otp}</b>.</p><p>This OTP is valid for 1 hour.</p>`,
      };
  
      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error.message);
          return res.status(500).json({ message: "Error sending email: " + error.message });
        } else {
          console.log("Email sent:", info.response);
          return res.status(200).json({ message: "OTP sent to your email", otp });
=======
//         const { email } = req.body;

//         // Search for the email in the user collection
//         let User = await user.findOne({ email });
//         let isAdmin = false;

//         // If not found in the user collection, search in the admin collection
//         if (!User) {
//             User = await admin.findOne({ email });
//             isAdmin = false;
//         }

//         // If the email is not found in either collection, return an error
//         if (!User) {
//             return res.status(404).json({ message: "User with this email does not exist" });
//         }

//         // Generate OTP
//         const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
//         const otpExpiration = new Date(Date.now() + 3600000); // OTP expires in 1 hour

//         // Save OTP and expiration to the user/admin
//         User.otp = otp;
//         User.otpExpiration = otpExpiration;
//         await User.save();

//         console.log(`OTP for ${User.email}: ${otp}`);

//         // Send OTP via email
//         const mailOptions = {
//             from: '"Vidhi 👻" <vidhisavaliya@gmail.com>',
//             to: User.email,
//             subject: "Password Reset OTP",
//             html: `<p>Your OTP for password reset is <strong>${otp}</strong></p><p>This OTP is valid for 1 hour.</p>`,
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 return res
//                     .status(500)
//                     .json({ message: "Error sending email: " + error.message });
//             } else {
//                 return res.status(200).json({ message: "OTP sent to your email", isAdmin:isAdmin,otp }); // Include OTP in the response
//             }
//         });
//     } catch (error) {
//         return res
//             .status(500)
//             .json({ message: "An error occurred: " + error.message });
//     }
// };

exports.sendotp = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Search for the email in the user collection
        let User = await user.findOne({ email });
        let isAdmin = false;

        // If not found in the user collection, search in the admin collection
        if (!User) {
            User = await admin.findOne({ email });
            isAdmin = true; // Email belongs to admin
>>>>>>> Stashed changes
        }

        // If the email is not found in either collection, return an error
        if (!User) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        // Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
        const otpExpiration = new Date(Date.now() + 3600000); // OTP expires in 1 hour

        // Save OTP and expiration to the respective user/admin object
        User.otp = otp;
        User.otpExpiration = otpExpiration;

        // Save changes to the respective collection
        if (isAdmin) {
            await User.save(); // Save to admin collection
        } else {
            await User.save(); // Save to user collection
        }

        console.log(`OTP for ${User.email}: ${otp}`);

        // Send OTP via email
        const mailOptions = {
            from: '"Vidhi 👻" <vidhisavaliya@gmail.com>',
            to: User.email,
            subject: "Password Reset OTP",
            html: `<p>Your OTP for password reset is <strong>${otp}</strong></p><p>This OTP is valid for 1 hour.</p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: "Error sending email: " + error.message });
            } else {
                return res
                    .status(200)
                    .json({ message: "OTP sent to your email", isAdmin, otp }); // Include isAdmin in the response
            }
        });
    } catch (error) {
<<<<<<< Updated upstream
      console.error("Error:", error.message);
      return res.status(500).json({ message: "An error occurred: " + error.message });
=======
        return res
            .status(500)
            .json({ message: "An error occurred: " + error.message });
>>>>>>> Stashed changes
    }
};


  exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find the user by email
        let User = await user.findOne({ email });

        if (!User) {
            User = await admin.findOne({ email });
        }

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
        let User = await user.findOne({ email });
        let isAdmin = false;

        if (!User) {
            User = await admin.findOne({ email });
            isAdmin = true;
        }

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
            message: "Password changed successfully.",
            isAdmin:isAdmin
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
        let User = await user.findOne({ email });


        if (!User) {
            User = await admin.findOne({ email });
        }

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