'use strict';

const _         = require('lodash');
const fs        = require('fs');
const validator = require('validator');

const hostPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';

module.exports = (context) => {
  const shell = context.shell;
  const logger = context.logger;

  function search(query, res) {
    const query_trim = query.trim();
    const query_parts = _.split(query_trim, ' ', 2);

    logger.log(query_parts);
    logger.log(query_parts.length);

    if (query_parts.length === 0 || query_parts[0].length === 0) {
      res.add({
        id: `help`,
        payload: 'help',
        title: 'How to',
        desc: 'For add a Host please type: /host IP domain.com'
      });
    } else if (query_parts.length === 1) {
      if (validator.isIP(query_parts[0])) {
        return res.add({
          id: `help`,
          payload: 'help',
          title: 'Add domain',
          desc: 'You should type a domain (e.g.: domain.com)'
        });
      } else {
        return res.add({
          id: `help`,
          payload: 'help',
          title: 'Write a valid IP',
          desc: 'You should type a valid IP (e.g.: 127.0.0.1)'
        });
      }
    } else {
      if (validator.isURL(query_parts[1], { require_protocol: false })) {
        return res.add({
          id: query_parts,
          payload: 'add',
          title: 'Validate',
          desc: 'Press enter for add the new host !'
        });
      } else {
        return res.add({
          id: `help`,
          payload: 'help',
          title: 'Write a valid domain',
          desc: 'You should type a valid domain (e.g.: domain.com)'
        });
      }
    }
  }

  function canWrite(path, callback) {
    fs.access(path, fs.W_OK, function(err) {
      callback(null, !err);
    });
  }

  function execute(host, payload) {
    if (payload !== 'add')
      return;
    canWrite(hostPath, function(err, isWritable) {
      if (isWritable) {
        fs.appendFile(hostPath, '\n    ' + host[0] + ' ' + host[1] + '\n', function(err) {
          if (err) {
            context.toast.enqueue("Impossible to write in the hosts file !");
          } else {
            context.toast.enqueue("Host added successfully to your hosts file.");
          }
        });
      } else {
        context.toast.enqueue("You haven't permissions to write in the hosts file !");
      }
    });

  }

  return { search, execute };
};
