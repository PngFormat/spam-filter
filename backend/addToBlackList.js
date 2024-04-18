import {BlacklistedUserModel} from "./Schema.js";

const addToBlacklist = async (username, reason) => {
    try {
        const blacklistedUser = new BlacklistedUserModel({ username, reason });
        await blacklistedUser.save();
        console.log(`User ${username} is added to blacklist for reason: ${reason}`);
    } catch (error) {
        console.error('Error adding user to blacklist:', error);
    }
};

export default addToBlacklist();