const env = process.env.NODE_ENV || 'development';
console.log('env *****', env)

if(env === 'development') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}

const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo');
const {User} = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });
  todo.save().then((doc) => {
    res.send(doc)
  }, err => {
    res.status(400).send(err);
  })
console.log(req.body);
})

app.get('/todos', (req,res) => {
  Todo.find().then(todos => {
    res.send({todos})
  }, err => {
    res.status(400).send(err);
  })
})

app.get('/todos/:id', (req,  res) => {
  const id = req.params.id;
  if(!ObjectID.isValid(id)) {
    res.status(404).send('id is not valid');
  } else {
    Todo.findById(id).then(todo => {
      if (todo) res.send({todo})
      else res.status(404).send('there is no todo with this id')
    }, err => res.status(400).send(err))
  }
})

app.patch('/todos/:id', (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['text', 'completed']);
  if(!ObjectID.isValid(id)) {
    res.status(404).send('id is not valid');
  }
  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then(todo => {
    if (!todo) res.status(404).send();
    res.send({todo})
  }).catch(e => res.status(400).send());
});

app.post('/users', (req, res) => {
  const user =  new User(_.pick(req.body, ['email', 'password']));

  user.save().then( () => {
    return user.generateAuthToken()
  }, err => {
    res.status(400).send(err);
  }).then(token => res.header('x-auth', token).send(user))
console.log(req.body);
})

app.listen(port, () => {
  console.log('server is running on port ',  port)
})

module.exports = { app }