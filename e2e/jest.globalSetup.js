/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const path = require('path')

// Runs once before any test suite. Validates that the required environment
// variables are present so tests fail fast with a clear error message.
module.exports = async () => {
  require('dotenv').config({ path: path.join(__dirname, '.env') })

  const missingEnvVars = ['CONSOLE_API_API_KEY', 'CONSOLE_API_ACCESS_TOKEN', 'CONSOLE_API_IMS_ORG_ID']
    .filter(v => !process.env[v]?.trim())
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
  }
}
