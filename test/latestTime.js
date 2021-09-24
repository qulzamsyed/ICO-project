// Returns the time of the last mined block in seconds
exports.latestTime = async () => {

    let { timestamp } = await web3.eth.getBlock(`latest`)
    return timestamp;
  }