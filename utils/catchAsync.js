module.exports = fn => {
  return (req, res, next) => {
    console.log('HERE');
    fn(req, res, next).catch(next);
    // fn(req, res, next).catch((err) => next(err));
  };
};
