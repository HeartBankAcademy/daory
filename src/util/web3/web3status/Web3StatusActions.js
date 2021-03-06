import store from '../../../store'
import Web3 from 'web3'

export const WEB3_INITIALIZED = 'WEB3_INITIALIZED'
function web3Initialized(results) {
  return {
    type: WEB3_INITIALIZED,
    payload: results
  }
}

export function getWeb3() {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', function(dispatch) {
    var results
    var web3 = window.web3

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {

      // Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider)

      // Determine the network connected according to network Id
      web3.version.getNetwork(
        function(err, netId) { 
        var network
        switch (netId) {
          case "1":
            network = 'Mainnet' 
            break
          case "2":
            network = 'Morden Testnet'
            break
          case "3":
            network = 'Ropsten Testnet'
            break
          case "4":
            network = 'Rinkeby Testnet'
            break
          case "42":
            network = 'Kovan Testnet'
            break
          default:
            network = 'Unknown Network ID: ' + netId
            break
        }
        results = {
          web3Instance: web3,
          network: network 
        }
        console.log('web3 detected, network: ' + network)
        store.dispatch(web3Initialized(results))
      })
    } else {
      // Fallback to localhost if no web3 injection.
      // Use the development console's port by default.
      var provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545')

      web3 = new Web3(provider)

      // Determine the network connected according to network Id
      web3.version.getNetwork(
        function(err, netId) { 
        var network
        switch (netId) {
          case "1":
            network = 'Mainnet' 
            break
          case "2":
            network = 'Morden Testnet'
            break
          case "3":
            network = 'Ropsten Testnet'
            break
          case "4":
            network = 'Rinkeby Testnet'
            break
          case "42":
            network = 'Kovan Testnet'
            break
          default:
            network = 'Unknown Network ID: ' + netId
            break
        }
        results = {
          web3Instance: web3,
          network: network 
        }
        console.log('No web3 instance injected, using Local web3.');
        store.dispatch(web3Initialized(results))
      })
    }
  })
}
