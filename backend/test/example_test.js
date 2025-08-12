
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const { addTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { expect } = chai;

// Helper to create mock res
function createRes() {
  return {
    status: sinon.stub().returnsThis(),
    json: sinon.spy(),
  };
}

describe('AddTask Function Test', () => {
  afterEach(() => sinon.restore());

  it('should create a new task successfully', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: 'New Task', description: 'Task description', deadline: '2025-12-31' }
    };

    const createdTask = { _id: new mongoose.Types.ObjectId(), userId: req.user.id, ...req.body };
    const createStub = sinon.stub(Task, 'create').resolves(createdTask);

    const res = createRes();
    await addTask(req, res);

    expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdTask)).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: 'New Task', description: 'Task description', deadline: '2025-12-31' }
    };
    sinon.stub(Task, 'create').throws(new Error('DB Error'));

    const res = createRes();
    await addTask(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('Update Function Test', () => {
  afterEach(() => sinon.restore());

  it('should update task successfully', async () => {
    const userId = new mongoose.Types.ObjectId();
    const taskId = new mongoose.Types.ObjectId().toString();

    const existingTask = {
      _id: taskId,
      userId,
      title: 'Old Title',
      description: 'Old',
      completed: false,
      deadline: '2025-01-01',
      save: sinon.stub().callsFake(function () {
        // mimic mongoose .save returning updated doc
        return Promise.resolve(this);
      })
    };

    const findOneStub = sinon.stub(Task, 'findOne').resolves(existingTask);

    const req = {
      user: { id: userId },
      params: { id: taskId },
      body: { title: 'New Title', completed: true }
    };
    const res = createRes();

    await updateTask(req, res);

    expect(findOneStub.calledOnceWith({ _id: taskId, userId })).to.be.true;
    expect(existingTask.title).to.equal('New Title');
    expect(existingTask.completed).to.equal(true);
    // controller returns res.json(updatedTask) without setting status 200
    expect(res.status.called).to.be.false;
    expect(res.json.calledOnce).to.be.true;
  });

  it('should return 404 if task is not found', async () => {
    const userId = new mongoose.Types.ObjectId();
    const taskId = new mongoose.Types.ObjectId().toString();

    sinon.stub(Task, 'findOne').resolves(null);

    const req = { user: { id: userId }, params: { id: taskId }, body: { title: 'X' } };
    const res = createRes();

    await updateTask(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;
  });

  it('should return 500 on error', async () => {
    const userId = new mongoose.Types.ObjectId();
    const taskId = new mongoose.Types.ObjectId().toString();

    sinon.stub(Task, 'findOne').throws(new Error('DB Error'));

    const req = { user: { id: userId }, params: { id: taskId }, body: { title: 'X' } };
    const res = createRes();

    await updateTask(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;
  });
});

describe('GetTask Function Test', () => {
  afterEach(() => sinon.restore());

  it('should return tasks for the given user', async () => {
    const userId = new mongoose.Types.ObjectId();

    const tasks = [
      { _id: new mongoose.Types.ObjectId(), title: 'Task 1', userId },
      { _id: new mongoose.Types.ObjectId(), title: 'Task 2', userId }
    ];

    const sortStub = sinon.stub().returns(tasks);
    const findStub = sinon.stub(Task, 'find').returns({ sort: sortStub });

    const req = { user: { id: userId } };
    const res = createRes();
    await getTasks(req, res);

    expect(findStub.calledOnceWith({ userId })).to.be.true;
    expect(sortStub.calledOnceWith({ createdAt: -1 })).to.be.true;
    expect(res.json.calledWith(tasks)).to.be.true;
    expect(res.status.called).to.be.false;
  });

  it('should return 500 on error', async () => {
    const userId = new mongoose.Types.ObjectId();
    sinon.stub(Task, 'find').throws(new Error('DB Error'));

    const req = { user: { id: userId } };
    const res = createRes();
    await getTasks(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

describe('DeleteTask Function Test', () => {
  afterEach(() => sinon.restore());

  it('should delete a task successfully', async () => {
    const userId = new mongoose.Types.ObjectId();
    const taskId = new mongoose.Types.ObjectId().toString();

    const deletedDoc = { _id: taskId, userId };
    const delStub = sinon.stub(Task, 'findOneAndDelete').resolves(deletedDoc);

    const req = { user: { id: userId }, params: { id: taskId } };
    const res = createRes();
    await deleteTask(req, res);

    expect(delStub.calledOnceWith({ _id: taskId, userId })).to.be.true;
    expect(res.json.calledWith({ message: 'Task deleted' })).to.be.true;
    // controller doesn't set 200 explicitly
    expect(res.status.called).to.be.false;
  });

  it('should return 404 if task is not found', async () => {
    const userId = new mongoose.Types.ObjectId();
    const taskId = new mongoose.Types.ObjectId().toString();

    sinon.stub(Task, 'findOneAndDelete').resolves(null);

    const req = { user: { id: userId }, params: { id: taskId } };
    const res = createRes();
    await deleteTask(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Task not found' })).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    const userId = new mongoose.Types.ObjectId();
    const taskId = new mongoose.Types.ObjectId().toString();

    sinon.stub(Task, 'findOneAndDelete').throws(new Error('DB Error'));

    const req = { user: { id: userId }, params: { id: taskId } };
    const res = createRes();
    await deleteTask(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});
