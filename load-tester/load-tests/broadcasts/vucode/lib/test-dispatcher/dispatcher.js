class Dispatcher {
  static execute(command) {
    return command.execute(...command.args);
  }
}

module.exports = Dispatcher;
