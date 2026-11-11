# Third-party notices

This repository contains only the end-to-end test suite and the Docker setup around it.
The application under test is **not** included: its source code is fetched from the upstream
repositories at pinned commits during `docker compose build` and is used unmodified, except for
one line in the Angular frontend (the API base URL, see README).

The Angular project also ships its own Playwright tests. They are not used or copied here; every
test, fixture and page object in this repository was written for this project.

## realworld-apps/aspnetcore-realworld-example-app

- Source: https://github.com/realworld-apps/aspnetcore-realworld-example-app
- Pinned commit: `9345f18abf36b778abe2f290467ba432bf1f7e5c`
- License: MIT

```text
MIT License

Copyright (c) 2019 Thinkster

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## realworld-apps/angular-realworld-example-app

- Source: https://github.com/realworld-apps/angular-realworld-example-app
- Pinned commit: `d426ec804f7d035c374aa4a1b48ecdb05a03eb02`
- License: MIT

```text
MIT License

Copyright (c) 2023 Thinkster
Copyright (c) 2026 c4ffein

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

TRADEMARK NOTICE

The Angular logo (logo.png) is a trademark of Google LLC and is not covered by
this MIT License. It is used here solely to indicate that this project is built
with Angular. This project is not officially affiliated with or endorsed by
Google or the Angular team.
```
