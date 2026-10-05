# Playbooks

* [Knowledge sources](knowledge-sources.md) - Where this bundle's concepts are derived from, and how to re-check each source on a later librarian run.
* [Releasing a new version](releasing.md)
* [Contributing to the plugin](contributing.md)
* [Knowledge registrar gate](knowledge-registrar-gate.md) - The knowledge-registrar.yaml workflow - validates the bundle on every pull request that touches it, and ties every newly added human: confirmation (the event this plugin's Confirm verb writes) to evidence GitHub holds - that person's approval of the pull request, or their verified signature on the commit that introduced it - with an environment-reviewer attestation as the escape hatch for a repository that cannot sign.
