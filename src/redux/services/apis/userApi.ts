// src/api/userApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { customFetchBaseQuery } from './rtkQueryInterceptor';
import { User } from '../../../types/redux/userInfoReducerType';
import { setUserInfo } from '../../features/userInfo/userInfoSlice';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: customFetchBaseQuery('https://routes.msg91.com/api/c'),
    endpoints: (builder) => ({
        getUser: builder.query<User, void>({
            query: () => '/getDetails',
            transformResponse: (response: { data: any }) => {
                const data = response.data[0]
                return {
                    name: data.name,
                    id: data.id,
                    email: data.email,
                    orgs: data.c_companies?.map((item: any) => {
                        return {
                            id: item?.id,
                            companyId: item?.meta?.companyId || '',
                            name: item?.meta?.companyName || item.name || ''
                        }
                    })
                }
            },

            // 👇 This is where we write to Redux after API success
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUserInfo(data));
                } catch (err) {
                    console.error('Failed to fetch user info:', err);
                }
            },
        }),
        switchWorkspace: builder.mutation<void, string>({
            query: (workspaceId) => ({
                url: '/switchCompany',
                method: 'POST',
                body: { company_ref_id: workspaceId }
            })
        }),
        updateUserProfile: builder.mutation<void, { name: string }>({
            query: (userData) => ({
                url: '/updateUser',
                method: 'PUT',
                body: {
                    user: {
                        name: userData.name
                    }
                }
            })
        })
    }),
});

export const { useGetUserQuery, useLazyGetUserQuery, useSwitchWorkspaceMutation, useUpdateUserProfileMutation } = userApi;
