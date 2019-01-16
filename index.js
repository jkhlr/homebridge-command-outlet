const {exec} = require("child_process");

let Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory(
        "homebridge-command-outlet",
        "CommandOutlet",
        CommandOutletAccessory
    );
};

function CommandOutletAccessory(log, config) {
    this.ON = 1;
    this.OFF = 0;

    this.name = config["name"];
    this.onCommand = config["on_command"];
    this.offCommand = config["off_command"];
    this.currentStatus = this.OFF;

    this.service = new Service.Outlet(this.name);
    this.service.getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
    this.service.getCharacteristic(Characteristic.OutletInUse)
        .on('get', this.getOutletInUse.bind(this));
}

CommandOutletAccessory.prototype.getServices = function() {
  return [this.service];
};

CommandOutletAccessory.prototype.getOn = function (callback) {
    callback(null, this.currentStatus);
};

CommandOutletAccessory.prototype.setOn = function (state, callback) {
    if (state === this.ON && this.onCommand) {
        exec(this.onCommand);
    } else if (state === this.OFF && this.offCommand) {
        exec(this.offCommand);
    }
    this.currentStatus = state;
    callback();
};

CommandOutletAccessory.prototype.getOutletInUse = function (callback) {
    callback(null, true)
};
