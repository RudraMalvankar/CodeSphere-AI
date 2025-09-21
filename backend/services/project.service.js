import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';

export const createProject = async ({
    name, userId
}) => {
    if (!name) {
        throw new Error('Name is required')
    }
    if (!userId) {
        throw new Error('UserId is required')
    }

    let project;
    try {
        project = await projectModel.create({
            name,
            users: [ userId ]
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        throw error;
    }

    return project;

}


export const getAllProjectByUserId = async ({ userId }) => {
    if (!userId) {
        throw new Error('UserId is required')
    }

    const allUserProjects = await projectModel.find({
        users: userId
    })

    return allUserProjects
}

export const addUsersToProject = async ({ projectId, users, userId }) => {

    if (!projectId) {
        throw new Error("projectId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId");
    }

    if (!users || !Array.isArray(users) || users.length === 0) {
        throw new Error("users array is required and cannot be empty");
    }

    if (!userId) {
        throw new Error("userId is required");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId");
    }

    // Resolve users array: allow either ObjectId strings or emails
    const resolvedUserIds = [];
    for (const u of users) {
        if (typeof u !== 'string') continue;

        // If it's a valid ObjectId, accept it
        if (mongoose.Types.ObjectId.isValid(u)) {
            resolvedUserIds.push(u);
            continue;
        }

        // Otherwise treat as email and look up the user
        const found = await import('../models/user.model.js').then(m => m.default).then(UserModel => UserModel.findOne({ email: u }));
        if (found) {
            resolvedUserIds.push(found._id.toString());
            continue;
        }

        // Not found by email: throw with a clear message
        throw new Error(`User not found for identifier: ${u}`);
    }

    // Deduplicate
    const uniqueIds = Array.from(new Set(resolvedUserIds));

    // Ensure the requesting user belongs to the project
    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    });

    if (!project) {
        throw new Error("Requesting user does not belong to this project");
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: uniqueIds
            }
        }
    }, {
        new: true
    }).populate('users');

    return updatedProject;

}

export const getProjectById = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users')

    return project;
}

export const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    return project;
}

export const addMessage = async ({ projectId, message, senderId }) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid Project ID");
    }

    if (!message) {
        throw new Error("Message is required");
    }

    if (!senderId) {
        throw new Error("Sender ID is required");
    }

    const project = await projectModel.findById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    const newMessage = {
        sender: senderId,
        message,
        timestamp: new Date(),
    };

    project.messages.push(newMessage);

    await project.save();

    return project;
};