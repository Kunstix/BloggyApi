const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.deleteOneBySlug = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.deleteOne({ slug: req.params.slug.toLowerCase() });

    if (!doc) {
      return next(new AppError(`No document found with that name`, 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Deletion was successful.'
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: doc
    });
  });

exports.getOneBySlug = (Model, popOptions, selectOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findOne({ slug: req.params.slug });
    // populate is performance heavy, creates another db query
    if (popOptions && popOptions.size !== 0) {
      popOptions.forEach(option => (query = query.populate(option)));
    }

    if (selectOptions) query = query.select(selectOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc
    });
  });

exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const features = new APIFeatures(Model.find({}), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();

    let query = features.query;
    if (popOptions && popOptions.size !== 0) {
      popOptions.forEach(option => (query = query.populate(option)));
    }
    const data = await query; // .explain returns DB Stats!

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      size: data.length,
      data
    });
  });
