/**
 * This file is for repeated calculations that are made in the main process
 */


/**
 * Check is an object is empty {}
 * @param {object} object The object to check
 * @returns {boolean} Whether or not the object is empty
 */
const objectIsNotEmpty = (object) => {
    return Object.keys(object).length !== 0;
};

/**
 * Gets the date of the estimated death date, according to the average human lifespan
 * @param {string} birthday Birthday in format yyyy-mm-dd
 * @returns {string} Estimated death date in format yyyy-mm-dd
 */
const getDeathDate = (birthday) => {
    const averageHumanLifespanYears = 73;

    let birthdayArray = birthday.split('-');
    const birthdayDate = new Date(birthday);
    const deathyear = birthdayDate.getFullYear() + averageHumanLifespanYears;

    const deathDate = `${deathyear}-${birthdayArray[1]}-${birthdayArray[2]}`

    return new Date(deathDate).toISOString().split('T')[0];
};

// Export functions
module.exports.objectIsNotEmpty = objectIsNotEmpty;
module.exports.getDeathDate = getDeathDate;