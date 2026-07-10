const CreditSale = require('./../models/CreditSale');

exports.getAllCreditSale = async (req, res) => {
  try {
    const user = req.session.user;
    let branchCreds, agentCreds;

    if (user.role === 'Manager') {
      branchCreds = await CreditSale.find().where('brname').equals(user.branch);
    } else if (user.role === 'Agent') {
      agentCreds = await CreditSale.find().where('agtname').equals(user.firstname);
    }

    res.status(200).render('credsales', {
      title: 'Credit Sale',
      user, branchCreds, agentCreds
    });
  } catch (err) {
    req.flash('error_message', 'Failed to retrieve Sale on Credit Records.');
    res.redirect('back');
  }
};

exports.getCreditSale = async (req, res) => {
  try {
    const creditSale = await CreditSale.findById(req.params.id);

    if (!creditSale) {
      req.flash('error_message', 'The requested record does not exist.');
      res.redirect('back');
    }

    res.status(200).render('editcreditsale', {
      creditSale,
      title: 'Edit Credit Sale',
      user: req.session.user
    });
  } catch (err) {
    req.flash('error_message', 'Failed to retrieve Sale on Credit Record.');
    res.redirect('back');
  }
};

exports.createCreditSale = async (req, res) => {
  try {
    await CreditSale.create(req.body);

    req.flash('success_msg', 'Successfuly created Sale on Credit Record.');
    res.redirect('back');
  } catch (err) {
    req.flash('error_msg', 'Failed to create Sale on Credit Record.');
    res.redirect('back');
  }
};

exports.updateCreditSale = async (req, res, next) => {
  try {
    await CreditSale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    req.flash('success_msg', 'Successfuly updated Sale on Credit Record.');
    res.redirect('back');
  } catch (err) {
    req.flash('error_message', 'Failed to update Sale on Credit Record.');
    res.redirect('back');
  }
};

exports.deleteCreditSale = async (req, res) => {
  try {
    await CreditSale.findByIdAndDelete(req.params.id);

    req.flash('error_message', 'Successfully deleted Sale on Credit Record.');
    res.redirect('back');
  } catch (err) {
    req.flash('error_message', 'Failed to delete Sale on Credit Record.');
    res.redirect('back');
  }
};
