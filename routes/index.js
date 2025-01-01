var express = require('express');
var router = express.Router();


var user=require('../Controller/Usercontroller')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/signup',user.Signup)
router.get('/signup',user.get_index)
router.post('/login',user.Login)
router.post('/sendotp', user.sendotp)
router.post('/verify',user.verifyOtp)
router.post('/changepsw',user.changePassword)
router.post('/resetpsw',user.resetPassword)

module.exports = router;