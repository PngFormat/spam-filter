const request = require('supertest');
const app = require('../spam-filter/src/App').default;
const { getMessages } = require('../backend/messages/messageController.js');
const { MessageModel } = require('../src/models/messageModel');

jest.mock('../');
jest.mock('../chatFilter.js');


describe('Message Controller', () => {
    let user, blacklistedUser, blacklistedReceiver, message;

    beforeAll(() => {
        user = { _id: 'userId', username: 'testuser' };
        blacklistedUser = { username: 'blacklistedUser' };
        blacklistedReceiver = { receiverId: 'userId' };
        message = { _id: 'messageId', text: 'test message', username: 'testuser', userId: 'userId' };

        UserModel.find.mockResolvedValue([user]);
        MessageModel.find.mockResolvedValue([message]);
        MessageModel.findByIdAndDelete.mockResolvedValue(message);
        BlacklistedUserModel.findOne.mockResolvedValue(null);
        BlacklistedReceiverModel.findOne.mockResolvedValue(null);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('postMessage', () => {
        it('should post a message successfully', async () => {
            const filterMessage = require('../chatFilter.js').filterMessage;
            filterMessage.mockReturnValue({ censoredText: 'test message', badWordCount: 0 });

            const response = await request(app)
                .post('/api/messages')
                .send({ text: 'test message', userId: 'userId', username: 'testuser' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.text).toBe('test message');
        });

        it('should return 429 if message limit is reached', async () => {
            const currentTime = Date.now();
            const checkMessageLimit = require('./messageMiddleware.js').checkMessageLimit;
            checkMessageLimit.mockReturnValue(true);

            const response = await request(app)
                .post('/api/messages')
                .send({ text: 'test message', userId: 'userId', username: 'testuser' });

            expect(response.status).toBe(429);
            expect(response.body).toHaveProperty('message', expect.stringContaining('Please wait'));
        });

        it('should return 403 if user is blacklisted', async () => {
            BlacklistedUserModel.findOne.mockResolvedValue(blacklistedUser);

            const response = await request(app)
                .post('/api/messages')
                .send({ text: 'test message', userId: 'userId', username: 'blacklistedUser' });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'You are blacklisted and cannot send messages');
        });

        it('should return 403 if receiver is blacklisted', async () => {
            BlacklistedReceiverModel.findOne.mockResolvedValue(blacklistedReceiver);

            const response = await request(app)
                .post('/api/messages')
                .send({ text: 'test message', userId: 'userId', username: 'testuser' });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'You are blacklisted and cannot receive messages');
        });
    });

    describe('getUserMessageCount', () => {
        it('should fetch user message counts successfully', async () => {
            const response = await request(app).get('/api/message-count');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('testuser', 1);
        });

        it('should return 500 on error', async () => {
            UserModel.find.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/message-count');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Error fetching user message count');
        });
    });

    describe('getMessages', () => {
        it('should fetch messages successfully', async () => {
            const response = await request(app).get('/api/messages');

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toHaveProperty('_id', 'messageId');
        });

        it('should return 500 on error', async () => {
            MessageModel.find.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/messages');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Error fetching messages');
        });
    });

    describe('deleteMessage', () => {
        it('should delete a message successfully', async () => {
            const response = await request(app).delete('/api/messages/messageId');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Message deleted successfully');
        });

        it('should return 404 if message not found', async () => {
            MessageModel.findByIdAndDelete.mockResolvedValue(null);

            const response = await request(app).delete('/api/messages/nonExistentMessageId');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Message not found or could not be deleted');
        });

        it('should return 500 on error', async () => {
            MessageModel.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/api/messages/messageId');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Error deleting message');
        });
    });
});
