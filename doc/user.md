# user api spec

## register user
endpoint: POST /api/users
request body:
```
{
  "username": "testing",
  "password": "secret1234",
  "confirmPassword": "secret1234",
  "name": "Bob Alice",
  "email": "bob@gmail.com",
  "phoneNumber": "+6281252252252"
}
```
response body (success):
```
{
  "data": {
    "username": "testing",
    "name": "Bob Alice",
    "email": "bob@gmail.com",
    "phoneNumber": "081252252252",
    "password": "hash(password)",
    "confirmPassword": "hash(confirmPassword)"
  }
}
```
response body (failed):
```
{
  "errors": [{
    "code": "too_small",
    "path": ["username"],
    "message": "Username must be at least 6 characters long"
  }]
}
```
