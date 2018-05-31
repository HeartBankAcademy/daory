import React from 'react'
import { ListItem } from '@material-ui/core'
import DAOContract from '../../../../build/contracts/DAO.json'
import store from '../../../store'
import TaskCard from './TaskCard.js'

const contract = require('truffle-contract')

export const TASKS_RETRIEVED = 'TASKS_RETRIEVED'
function tasksRetrieved(tasks) {
return {
    type: TASKS_RETRIEVED,
    payload: tasks
  }
}

function asyncGetAllTasks(DAOInstance, coinbase, i, count, result, dispatch) {
  if(i < count) {
    // get specific task and push to an array
    DAOInstance.tasks.call(i, {from: coinbase})
    .then(function(res) {
      let task = {
        proposer: res[0], // member who proposed the task 
        name: res[1],
        title: res[2],       // task name
        content: res[3],   // task detail
        voteCount: res[4].toNumber(),       // number of accumulated votes
        nonconsensus: res[5], // bool to signal that someone voted no
        finished: res[6]     // bool to signal voting has finished
      }

      let taskCard = <ListItem key={i.toString()}>{TaskCard(task)}</ListItem>
      if (!task.finished) {
        result.proposedList.push(taskCard)
        console.log('asynchronously put task #', i, ' in proposedList ', result.proposedList)
      } else if (!task.nonconsensus) {
        result.approvedList.push(taskCard)
        console.log('asynchronously put task #', i, ' in approvedList ', result.approvedList)
      } else {
        result.disapprovedList.push(taskCard)
        console.log('asynchronously put task #', i, ' in disapprovedList ', result.disapprovedList)
      }
      asyncGetAllTasks(DAOInstance, coinbase, i + 1, count, result, dispatch)
    })
    .catch(function(err) {
      alert('failed to get task #' + i)
    })
  } else {
    console.log('dispatching tasks update')
    dispatch(tasksRetrieved(result))
  }
}

export function retrieveTasks() {
  let web3 = store.getState().web3.web3Instance

  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {

    return function(dispatch) {
      // Using truffle-contract we create the DAO object.
      const DAO = contract(DAOContract)
      DAO.setProvider(web3.currentProvider)

      // Declaring this for later so we can chain functions on DAO.
      var DAOInstance

      // Get current ethereum wallet.
      web3.eth.getCoinbase((error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }

        DAO.deployed()
        .then(function(instance) {
          DAOInstance = instance

          // DAOInstance.getTaskCount.call({from: coinbase})
          // .then(function(count) {
          //   let lists = {
          //     proposedList: [],
          //     approvedList: [],
          //     disapprovedList: []
          //   }
          //   asyncGetAllTasks(DAOInstance, coinbase, 0, count, lists, dispatch)
          // })

          DAOInstance.newTask().watch((err, res) => {
            if (!err) {
              DAOInstance.getTaskCount.call({from: coinbase})
              .then(function(count) {
                let lists = {
                  proposedList: [],
                  approvedList: [],
                  disapprovedList: []
                }
                console.log('New task update')
                asyncGetAllTasks(DAOInstance, coinbase, 0, count, lists, dispatch)
              })
            }
          })
        })
        .catch(function(result) {
          console.log('DAO not deployed')
        })
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}