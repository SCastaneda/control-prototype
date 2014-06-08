
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.show = function(req, res){
  res.render('screen', { room: req.params.room });
};

exports.control = function(req, res){
  res.render('control', { room: req.params.room });
};