import { beforeEach, afterEach, expect, describe, it, vi, } from 'vitest';
import { asyncPopulateUsersAndTalks } from './action';
import { receiveTalksActionCreator } from '../talks/action';
import { receiveUsersActionCreator } from '../users/action';
import { showLoading, hideLoading } from '@dimasmds/react-redux-loading-bar';
import api from '../../utils/api';

const fakeTalksResponse = [
    {
        id: 'talk-1',
        text: 'Talk Test-1',
        user: 'user-1',
        replyTo: '',
        likes: [],
        createdAt: '2022-09-22T10:06:55.588Z',
    },
];

const fakeUsersResponse = [
    {
        id: 'user-1',
        name: 'User Test 1',
        photo: 'https://generated-image-url.jpg',    
    },
];

const fakeErrorResponse = 
    /*{
        message: 'Ada Error Response',
    }*/
    new Error('Ups, something went wrong!');

describe('asyncPopulateUsersAndTalks thunk', () => {
    beforeEach(() => {
        api._getAllUsers = api.getAllUsers;
        api._getAllTalks = api.getAllTalks;
    });

    afterEach(() => {
        api.getAllUsers = api._getAllUsers;
        api.getAllTalks = api._getAllTalks;

        delete api._getAllUsers;
        delete api._getAllTalks;
    });

    it('should dispatch action correctly when data fetching success', async () => {
        api.getAllUsers = () => Promise.resolve(fakeUsersResponse);
        api.getAllTalks = () => Promise.resolve(fakeTalksResponse);

        const dispatch = vi.fn();

        await asyncPopulateUsersAndTalks()(dispatch);
        console.log(JSON.stringify(dispatch.mock.calls, null, 2));
        console.log('DISPATCH CALLS:', dispatch.mock.calls);

        expect(dispatch).toHaveBeenCalledWith(showLoading());
        console.log(showLoading());
        expect(dispatch).toHaveBeenCalledWith(receiveTalksActionCreator(fakeTalksResponse));
        expect(dispatch).toHaveBeenCalledWith(receiveUsersActionCreator(fakeUsersResponse));
        expect(dispatch).toHaveBeenCalledWith(hideLoading());
        console.log('HIDE LOADING: ', hideLoading());
    });
    
    it('should dispatch action correctly and call alert when data fetching failed', async () => {
        api.getAllUsers = () => Promise.reject(fakeErrorResponse);
        api.getAllTalks = () => Promise.reject(fakeErrorResponse);

        const dispatch = vi.fn();

        window.alert = vi.fn();

        await asyncPopulateUsersAndTalks()(dispatch);
        console.log('DISPATCH CALLS:', dispatch.mock.calls);

        expect(dispatch).toHaveBeenCalledWith(showLoading());
        expect(dispatch).toHaveBeenCalledWith(hideLoading());
        expect(window.alert).toHaveBeenCalledWith(fakeErrorResponse.message);

    });
});

