const { AuthenticationError } = require("apollo-server-express")
const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { Query } = require("mongoose");

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findById(context.user._id);
            }
            throw new AuthenticationError('Must log in');
        },
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect email or password');
            }

            const validPassword = await user.isCorrectPassword(password);

            if (!validPassword) {
                throw new AuthenticationError('Incorrect email or password')
            }

            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },

        saveBook: async (parent, { input }, context) => {
            if (context.user) {
                try {
                    const updatedUser = await User.findByIdAndUpdate(
                        context.user._id,
                        { $addToSet: { savedBooks: input } },
                        { new: true, runValidators: true }
                    );

                    return updatedUser;
                } catch (error) {
                    throw new Error('Error saving book.')
                }
            }
            throw new AuthenticationError('Please log in.');
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    context.user._id,
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );

                return updatedUser;
            }
            throw new AuthenticationError('Please log in.');
        },
    },
};

module.exports = resolvers;