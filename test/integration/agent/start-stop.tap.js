'use strict'

const tap = require('tap')
const configurator = require('../../../lib/config')
const Agent = require('../../../lib/agent')


tap.test('Collector API should connect to staging-collector.newrelic.com', (t) => {
  const config = configurator.initialize({
    app_name: 'node.js Tests',
    license_key: 'd67afc830dab717fd163bfcb0b8b88423e9a1a3b',
    host: 'staging-collector.newrelic.com',
    port: 443,
    ssl: true,
    utilization: {
      detect_aws: false,
      detect_pcf: false,
      detect_gcp: false,
      detect_docker: false
    },
    logging: {
      level: 'trace'
    }
  })
  const agent = new Agent(config)

  agent.start((error, returned) => {
    t.notOk(error, 'connected without error')
    t.ok(returned, 'got boot configuration')
    t.ok(returned.agent_run_id, 'got run ID')
    t.ok(agent.config.run_id, 'run ID set in configuration')

    agent.stop((error) => {
      t.notOk(error, 'should have shut down without issue')
      t.notOk(agent.config.run_id, 'run ID should have been cleared by shutdown')

      t.end()
    })
  })
})

tap.test('Agent should not connect to collector in serverless mode', (t) => {
  const config = configurator.initialize({
    app_name: 'node.js Tests',
    serverless_mode: {
      enabled: true
    },
    feature_flag: {
      serverless_mode: true
    },
    logging: {
      level: 'trace'
    }
  })
  const agent = new Agent(config)

  // Immediately fail if connect is called
  agent.collector.connect = () => t.fail('Agent should not attempt to connect')

  agent.start((error, returned) => {
    t.notOk(error, 'started without error')
    t.ok(returned, 'got boot configuration')
    t.notOk(returned.agent_run_id, 'should not have a run ID')
    t.notOk(agent.config.run_id, 'should not have run ID set in configuration')

    agent.stop((error) => {
      t.notOk(error, 'should have shut down without issue')

      t.end()
    })
  })
})
