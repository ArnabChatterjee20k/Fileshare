### Features

- Organisation switcher using clerk organisation
- File Restoration process
- File authorisation process

### How file authorization si taking place?

- We can do it in multiple ways

  - We can make a http request to clerk on every file request but that will lead rate limiting on large scale
  - Addind files identities in the jwt but convex allow only open id specs
- So we are using clerk webhooks and convex http actions. Create webhook endpoint in the clerk. The endpoint will be the http action endpoint. The endpoint is of the format `https://<your deployment name>.convex.site (e.g. https://happy-animal-123.convex.site)`. Present in the http actions docs. The deployment will be present in the .env.local

  Also remove the dev: from the name.

  And add the http endpoint like /clerk

  Example -> https://reminiscent-pony-148.convex.site/clerk
- Since clerk webhooks use svix so we need to run the http action in the node js runtime instead of convex runtime
- Also it will be an internal action will be created for clerk webhook
- ALso here we are attaching NEXT_PUBLIC_CONVEX_URL to the token identifier to distinguish its a convex one
- Also add the env variables like CLERK_WEBHOOK_SECRET in the convex dashboard

### More things to do

* [ ] Add import pdf from notion
* [ ] Add vector search
