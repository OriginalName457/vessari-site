# Pre-registration: does relaxation move a predicted pose toward the crystal

Written 16 October 2026, before the benchmark has been downloaded.

## The question

Our restrained minimisation takes predicted complexes from 70.2 percent
PoseBusters valid to 98.5 percent, moving the ligand by a median of 0.847
angstroms and the protein backbone by 0.100. Those numbers are measured and
published at `benchmarks/results/2026-10-16-relaxation-displacement.md`.

They do not say whether the relaxed pose is nearer the experimental structure
than the one it replaced. Our corpus proteins were folded from sequence and
no crystal structure of those complexes exists to measure against.

The PoseBusters benchmark holds several hundred recent Protein Data Bank
complexes where the crystal ligand is known. On that set the question is
answerable.

## Why it decides whether this is a product

Making a pose physically valid is worth something on its own, because a
reviewer runs PoseBusters and a molecular dynamics run will not start from a
steric clash. It is worth considerably more if the relaxed pose is also
closer to the truth, and considerably less if it is further away.

A method that fixes the check while walking away from the crystal is passing
an exam rather than improving a structure, and we would rather find that
ourselves.

## What we will do

Take the PoseBusters benchmark set. For each complex, dock or co-fold a pose
by the same pipeline we use, or take a published predicted pose where one is
distributed with the set. Run PoseBusters on it, run our relaxation on it, run
PoseBusters again, and measure ligand RMSD to the crystal before and after.

Symmetry corrected RMSD, heavy atoms, after superposing on the protein, which
is the convention the benchmark uses.

## Primary outcome

**The paired change in ligand RMSD to the crystal, before relaxation minus
after, over complexes that failed at least one PoseBusters check.** Positive
means relaxation moved the pose toward the crystal. Reported with a bootstrap
interval over complexes.

## Secondary outcomes

- The same change over every complex, including those that already passed,
  because relaxing a pose that was already valid must not spoil it.
- The share of complexes crossing the 2.0 angstrom line in each direction.
- PoseBusters validity before and after on this set, to check the 70.2 to 98.5
  figure transfers off our own poses.
- Backbone RMSD, to confirm the restraint behaves as it does on our corpus.

## Decision rule, fixed now

- **Relaxation improves poses** if the paired change over failing complexes is
  above zero with an interval excluding zero. We then say it, with the number.
- **Relaxation is cosmetic** if the interval contains zero. We then say that
  it makes a pose physically valid without moving it closer to the truth,
  which is still worth 18 seconds to anybody about to run molecular dynamics,
  and we stop implying more.
- **Relaxation damages poses** if the change is below zero with an interval
  excluding zero. We then publish that, withdraw the relaxation step from the
  pipeline, and the 98.5 percent figure comes off the site.

If more than 10 percent of complexes that already passed PoseBusters fail
after relaxation, the step is withdrawn regardless of the primary outcome.

## Prior, stated

A restrained minimisation in a force field relieves clashes by pushing atoms
apart along the shortest route. There is no term in it that knows where the
crystal ligand sits. So the honest prior is that the change will be small and
may well contain zero, and the reason to run it is that the alternative is
selling a number whose meaning we have not checked.

## What this cannot show

The benchmark is recent Protein Data Bank structures, which are solved
complexes. A predicted pose on a protein with no solved structure anywhere is
the case we actually sell into, and it is not in this set.
