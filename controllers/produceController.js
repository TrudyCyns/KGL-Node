const path = require('node:path');

const Produce = require('./../models/Produce');

exports.getAllProduce = (req, res) => {
  try {
    // TODO: API layer

    // const user = req.session.user;

    // let branchProcs = await Produce.find().where('brname').equals(user.branch)

    res.sendFile(path.join(__dirname, '../src/protected-pages/produce.html'));
  } catch (err) {
    req.flash('error_message', 'Failed to retrieve Procurement Records.');
    res.redirect('back');
  }
};

exports.getProduce = (req, res) => {
  try {
    // TODO: API layer
    
    // const produce = await Produce.findById(req.params.id);

    res.sendFile(
      path.join(__dirname, '../src/protected-pages/editproduce.html'),
    );
  } catch (err) {
    req.flash('error_message', 'Failed to retrieve Procurement Record.');
    res.redirect('back');
  }
};

exports.createProduce = async (req, res) => {
  try {
    await Produce.create(req.body);

    req.flash('success_msg', 'Successfuly created Procurement Record.');
    res.redirect('back');
  } catch (err) {
    req.flash('error_message', 'Failed to create Procurement Record.');
    res.redirect('back');
  }
};

exports.updateProduce = async (req, res) => {
  try {
    await Produce.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    req.flash('success_msg', 'Successfuly updated Procurement Record.');
    res.redirect('back');
  } catch (error) {
    req.flash('error_message', 'Failed to update Procurement Record.');
    res.redirect('back');
  }
};

exports.deleteProduce = async (req, res) => {
  try {
    await Produce.findByIdAndDelete(req.params.id);

    req.flash('success_msg', 'Successfuly deleted Procurement Record.');
    res.redirect('back');
  } catch (err) {
    req.flash('error_message', 'Failed to delete Procurement Record.');
    res.redirect('back');
  }
};
