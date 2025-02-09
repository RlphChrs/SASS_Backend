

exports.validateRegistration = (req, res, next) => {
    const { schoolName, firstName, lastName, email, password, repeatPassword, } = req.body;
  
    if (!schoolName || !firstName || !lastName || !email || !password || !repeatPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    if (password !== repeatPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    next();
  };
  