const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
router.use(bodyParser.json());

const {Post} = require('./models')

router.get('/', (req, res) => {
	Post
		.find()
		.then(posts => {
			res.json(posts.map(post => post.serialize()));
		})
		.catch(err => {
			console.error(err);
			res.staus(500).json({ message: 'Internal server error' });
		});
});

router.get('/:id', (req, res) => {
	Post
		.findById(req.params.id)
		.then(post => res.json(post.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

router.post('/', (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	requiredFields.forEach(field => {
		if (!field in req.body) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	})

	Post
		.create({
			title: req.body.title,
			content: req.body.content,
			author: req.body.author,
		})
		.then(post => res.status(201).json(post.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

router.put('/:id', (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		res.status(400).json({
			error: 'Request path id and request body id must match'
		});
	}

	const updated = {};
	const updateableFields = ['title', 'content', 'author'];

	updateableFields.forEach(field => {
		if (field in req.body) {
			updated[field] = req.body[field];
		}
	});

	Post
		.findByIdAndUpdate(req.params.id, { $set: updated })
		.then(updatedPost => res.status(204).end())
		.catch(err => res.status(500).json({ message: 'Internal server error'}));
});

router.delete('/:id', (req, res) => {
	Post
		.findByIdAndRemove(req.params.id)
		.then(post => res.status(204).end())
		.catch(err => res.status(500).json({ message: 'Internal server error' }));
});

router.use('*', function (req, res) {
	res.status(404).json({ message: 'Not found' });
});

