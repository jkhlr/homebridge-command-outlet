const {execSync} = require("child_process");

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
    this.ON = true;
    this.OFF = false;

    this.log = log;

    this.name = config["name"];
    this.onCommand = config["on_command"];
    this.offCommand = config["off_command"];
    this.timeout = config["timeout"] || 0;
    this.currentState = this.OFF;

    this.service = new Service.Outlet(this.name);
    this.service.getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));
    this.service.getCharacteristic(Characteristic.OutletInUse)
        .on('get', this.getOutletInUse.bind(this));

    this.execCommand = (command) => {
        const output = execSync(command).toString();
        this.log(`CommandOutlet switched. Command: '${command}', Output: '${output}'`);
    }
}

CommandOutletAccessory.prototype.getServices = function () {
    return [this.service];
};

CommandOutletAccessory.prototype.getOn = function (callback) {
    callback(null, this.currentState);
};

CommandOutletAccessory.prototype.setOn = function (state, callback) {
    let command;
    if (state === this.ON && this.onCommand) {
        command = this.onCommand;
    } else if (state === this.OFF && this.offCommand) {
        command = this.offCommand;
    }
    setTimeout(() => {this.execCommand(command)}, this.timeout);
    this.currentState = state;
    callback();
};

CommandOutletAccessory.prototype.getOutletInUse = function (callback) {
    callback(null, true)
};
