const Sale = require('./../models/Sale');

exports.getAllSales = async (req, res) => {
  try {
    const user = req.session.user;
    let branchSales, agentSales;
    if (user.role === 'Manager') {
      branchSales = await Sale.find().where('brname').equals(user.branch);
    } else if (user.role === 'Agent') {
      agentSales = await Sale.find().where('agtname').equals(user.firstname);
    }

    res.status(200).render('sales', {
      title: 'Sales',
      user,
      branchSales,
      agentSales,
    });
  } catch (err) {
    req.flash('error_message', 'Failed to update Sales Records.');
    res.redirect('back');
  }
};

exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      req.flash('error_message', 'The requested record does not exist.');
      res.redirect('back');
    }

    res.status(201).render('editsales', {
      sale,
      title: 'Edit Sale',
      user: req.session.user
    });
  } catch (err) {
    req.flash('error_message', 'Failed to retrieve Sale Record.');
    res.redirect('back');
  }
};

exports.createSale = async (req, res) => {
  try {
    await Sale.create(req.body);

    req.flash('success_msg', 'Successfuly created Sale Record.');
    res.redirect('back');
  } catch (err) {
    req.flash('error_message', 'Failed to create Sale Record.');
    res.redirect('back');
  }
};

exports.updateSale = async (req, res) => {
  try {
    await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    req.flash('success_msg', 'Successfuly updated Sale Record.');
    res.redirect('back');
  } catch (err) {
    req.flash('error_message', 'Failed to update Sale Record.');
    res.redirect('back');
  }
};

exports.deleteSale = async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);

    req.flash('error_message', 'Successfully deleted Sale Record.');
    res.status(204).redirect('back');
  } catch (err) {
    req.flash('error_message', 'Failed to delete Sale Record.');
    res.redirect('back');
  }
};
