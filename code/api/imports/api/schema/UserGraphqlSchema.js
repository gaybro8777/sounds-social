import { flow, get } from 'lodash/fp'
import { check } from 'meteor/check'
import { resolver, typeDef } from 'meteor/easy:graphqlizer'
import { userCollection } from '../../data/collection/UserCollection'
import { followUser } from '../../data/collection/methods/User/followUser'
import { fetchOneUserById } from '../../data/collection/methods/User/fetchOneUserById'
import { unfollowUser } from '../../data/collection/methods/User/unfollowUser'
import { isFollowedByUser } from '../../data/collection/methods/User/isFollowedByUser'
import { fetchGroupsForUser } from '../../data/collection/methods/Group/fetchGroupsForUser'
import { fetchOneProfile } from '../../data/collection/methods/Profile/fetchOneProfile'

export default {
  resolvers: {
    Query: {
      getUser: resolver.get(userCollection),
      listUser: resolver.list(userCollection),
      currentUser: (root, args, context) =>
        flow(get('userId'), fetchOneUserById)(context),
    },
    Mutation: {
      followUser: (root, args, context) => {
        const { toFollowId } = args
        check(toFollowId, String)

        followUser(toFollowId)(context.userId)
        return fetchOneUserById(context.userId)
      },
      unfollowUser: (root, args, context) => {
        const { toUnfollowId } = args
        check(toUnfollowId, String)

        unfollowUser(toUnfollowId)(context.userId)
        return fetchOneUserById(context.userId)
      },
    },
    User: {
      canFollow: (root, args, context) =>
        context.userId && root._id !== context.userId,
      isFollowedByCurrentUser: (root, args, context) =>
        isFollowedByUser(root._id)(context.userId),
      profile: flow(get('_id'), fetchOneProfile),
      groups: (root, args, context) =>
        fetchGroupsForUser(root._id)(context.grapherFields),
    },
  },
  typeDefs: [
    typeDef.get('User'),
    typeDef.list('User'),
    `
    type User {
      _id: String!
      username: String!
      canFollow: Boolean
      isFollowedByCurrentUser: Boolean
      profile: Profile
      groups: [Group]
    }
    
    input UserInput {
      username: String!
    }
    
    extend type Query {
      currentUser: User
    }
    extend type Mutation {
      followUser(toFollowId: String!): User
      unfollowUser(toUnfollowId: String!): User
    }
    `,
  ],
}
