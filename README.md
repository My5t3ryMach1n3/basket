# Basket

The basket service from the [walkthrough in Bearing's product spec](https://github.com/My5t3ryMach1n3/bearing/blob/main/docs/product-spec.md#walkthrough-a-greenfield-service), replayed on real pull requests to prove Bearing's loop before v0.1 ([bearing#25](https://github.com/My5t3ryMach1n3/bearing/issues/25)). Its code comes from Bearing's basket fixture, `test/fixtures/basket/`.

Requirements are the issues labelled `requirement`. The target architecture is `architecture/workspace.dsl`, and every PR is checked against it by the Bearing workflows in `.github/workflows/`.

Terraform under `infra/` is only ever parsed by Bearing. Never run `terraform apply`.
