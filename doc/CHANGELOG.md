0.9.0
-----
- add support for storing http basic auth crendentials (`--skiptTest` option id `add` command)

0.8.0
-----
- add update notifier

0.7.0
-----
- added `alias` option to the `add` command to specify aliases for the user on one import.
- added support to import source vault from http url (e.g. uuBt) to `import` command using credentials from the default vault. 
- added support to import access codes from text (plus4u mall) format to `import` command. Can be used to bulk load credentials for legacy apps. See [sample](./plus4uImportSample.txt). Pass `-t txt` to import this file type.

0.6.0
-----
- add `import` command
- all commands(`add`, `ls`, `rm`) now supports external secure store

0.5.0
-----
- use oidcg02(https://uuidentity.plus4u.net/uu-oidc-maing02/bb977a99f4cc4c37a2afce3fd599d0a7/oidc) as default.

0.4.2
-----
- Fix publication error.

0.4.1
-----
- Fix error reporting.

0.4.0
-----
- refactoring CLI interface.
- add `ls` command.


0.3.2
-----
- add missing mkdirp dependency

0.3.1
-----
- remove keytar dependency. 

0.3.0
-----
- Configurable URL to the OIDC server.

0.2.2
-----

Bugfix:
- Fix doc.


0.2.0
-----
- Initial version. Supports **add** and **delete** commands.

