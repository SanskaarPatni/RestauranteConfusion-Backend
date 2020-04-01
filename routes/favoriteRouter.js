const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favourite');
const Dishes = require('../models/dishes');
const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((fav) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((fav) => {
                if (fav) {
                    for (var i = 0; i < req.body.length; i++) {
                        if (fav.dishes.indexOf(req.body[i]._id) === -1) {
                            fav.dishes.push(req.body[i]._id);
                        }
                    }
                    fav.save()
                        .then((fav) => {
                            console.log('Favorite created');
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(fav);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
                else {
                    Favorites.create({
                        "user": req.user._id,
                        "dishes": req.body
                    })
                        .then((fav) => {
                            console.log('Favorite Created ', fav);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(fav);
                        }, (err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOneAndRemove({
            "user": req.user._id
        })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        //since we dont want get to work
        Favorites.findOne({ user: req.user._id })
            .then((fav) => {
                if (!fav) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": fav })
                }
                else {
                    if (fav.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favorites": fav });
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favorites": fav })
                    }
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((fav) => {
                if (fav) {
                    if (fav.dishes.indexOf(req.params.dishId) === -1) {
                        fav.dishes.push(req.params.dishId);
                    }
                    fav.save()
                        .then((fav) => {
                            console.log('Favorite created');
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(fav);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
                else {
                    Favorites.create({
                        "user": req.user._id,
                        "dishes": [req.params.dishId]
                    })
                        .then((fav) => {
                            console.log('Favorite Created ', fav);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(fav);
                        }, (err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/' + req.params.dishId);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({
            "user": req.user._id
        })
            .then((fav) => {
                if (fav) {
                    var index = fav.dishes.indexOf(req.params.dishId);
                    if (index !== -1) {
                        fav.dishes.splice(index, 1);
                    }
                    fav.save()
                        .then((fav) => {
                            console.log('Favorite dish deletd');
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(fav);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
                else {
                    err = new Error('Not marked as a favorite dish!');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = favoriteRouter;