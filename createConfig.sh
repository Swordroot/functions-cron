gcloud beta runtime-config configs variables set client_email firebase-adminsdk-6vfev@confession-room-frx.iam.gserviceaccount.com --config-name pushAPI --is-text
key=`echo -e "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCX5ygvcwaXu+Cr\nZi/dbBsA97Dx/H8YxU5bSH336nNYVRLzLZRLodo6QpaidTS5kIHFGM//eDeYWU4S\nY7bHWyW/Wm5TDGM7cCHgN13ld3HspKztKSY/rtNZqqe8NrVFWp6CBUHgA5o0KFDN\nUAf1aAOTGGcImo3SAYdxF3Cj4UkJvIbxiv6Glwa4U6Pvmrbud4b+G4bU2tPaczoS\n3ydVHQcXed+LqHfia7s+5ms5UmwHmNQFV31EPNywlgloFWbZPpyzmuZ36Ir7Asrj\nye9xwEQurgdpHmYb702HCGzMh4GhW1LoybrFWDz6Ip8y0c5ajoZebNKM0HEIF0Q4\nmGNgjqjxAgMBAAECggEAANZ4fGroifMyRF4iQvKEic8tgmdav+UsrxuzMcGxBHdA\nDSfLjG9wCVS4yULj7GcT4PJBVjhQd2GWT0snmBAt+qqlKgX+N4OnjpNEZds9PVy6\n8gbnuPLkcJ22LzdOoIglEI4DXj8ro7Oz0fup3Sxg73fmiSyP18a3rsO+Lj7NycUA\nFt/RSbDskNNP46HcyQyZmUs/+Jtk3nT/k5i3VT7YvqMgZjFXRHtq4EZ6AcPJ52EV\n0MVpEaqrgH8u2vzxP0CweS+cRtm/UH+xD22xS9yXyOfCuKgLSJAOSzPjiUaWJlP3\nqfFjcO6LKUtsdbDsI1qk36aNvAYY8LMpdWt/StfxAQKBgQDFPP5YdCI3m3HI1NyW\nCc95Ehxjs6mcaLZQgLKkIwjrU+lT+gMSfkAJ9X7+A87AnAWgiWt27VX9ILdI7FB+\ndIrTlPWanYvxP42oJ5CiJ/TuN9AVHieNBz62aScylwB5aRKszlmOcPtCfH6eUMuU\nFR7ArgtjqzBO1dQ56qXohH1oMQKBgQDFKIWXy2jVqh/so0szegndw7uqOZ3PQjyo\njnXwHhWsb+d+WKNn2pojvxRKKAZvs4q0qni6LrdM8M5Rlzc7MTi1DtzrxRjPPnIV\ncO8YIWVQTKz8qB/vI2TNU+6oHtjadMHETZu0+UGuE/qn4Tj0Iog5EW2XIFrI/j0e\nyTcjCsncwQKBgAyog3JN0bxb34uSDa4bZxNQFD5Z03LUTY8RE2XxUas4sWrQSs4v\nCBEbjlDjEavO15Wb/Cefx7r9FIY7lFbpR9eYYcLQhaCwAXlfQKsHgXKgZlxUmRk1\n89JlITzf8AnasnYgsCKyIY38y2uBp+8TA+w9v0FgRTNqCbrF0mv/xMShAoGBAL1e\nopKeSd+QPIGqhry252seac6i8LT2RhUQYK919hNemNd+g9Vo3sye5/oiX6xCo2PM\nqZEK9fzs/v7XY7FzIaim0gOTmLTWofV+N+jRiuKKA03annGvaU7e40iP+HI72zGV\n6Yz2LOPrRMKjTXURBg7qcnzKEukjacl8M31xC1sBAoGAWi5XC3roswHRDaMv1KDu\ns7nMWQh3S7M9VaFQqsfXMvLtqWh/VK9NSKf4bsvBSQSX4LKMPNHE2z0jphsaGMOe\ncsD04+L9ypdtldxXWZkw/cFYT1RA2r+RxHXb06/pjHV8ksR2hprkmZxBWrSRNE22\n0DUIAe5MjTjPI7hs68HTuO4=\n-----END PRIVATE KEY-----\n"`
gcloud beta runtime-config configs variables set private_key "$key" --config-name pushAPI --is-text
