const isSpam = (message: string): boolean => {
    const spamKeywords = ['spam', 'advertisement', 'unwanted word'];
    const lowerCaseMessage = message.toLowerCase();
    return spamKeywords.some(keyword => lowerCaseMessage.includes(keyword));
};

export default isSpam;