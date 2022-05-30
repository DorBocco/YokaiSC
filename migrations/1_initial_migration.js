const Yokai = artifacts.require("Yokai");

module.exports = function (deployer) {
  deployer.deploy(Yokai, "initialURI", "0xfcb377ba5a05a80c4e6874d3c4428218cb324557");
};
