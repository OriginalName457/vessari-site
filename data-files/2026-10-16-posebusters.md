# Do our predicted complexes survive the check reviewers run first

Run 16 October 2026. Numbers in `benchmarks/results/posebusters.json`,
reproduce with `scripts/posebusters_check.py`. PoseBusters 0.6.5, dock mode.

## Why we ran it

PoseBusters asks whether a predicted complex is chemically valid, whether its
geometry is physically possible, and whether the ligand sits inside the protein
rather than through it. The field runs it before reading an affinity, because a
good number on an impossible pose is a good number by accident.

We had 658 predicted complexes across 28 proteins and had never run it.

Dock mode rather than redock, because we have no crystal structure for most of
these. That gives the validity and the protein ligand checks. There is no RMSD
to a true pose in this result and there cannot be.

## Result

**462 of 658 complexes pass every check, 70.2 percent.**

The failures are almost all one check.

| check | failures |
|---|---|
| minimum distance to protein | 192 |
| volume overlap with protein | 3 |
| double bond flatness | 2 |
| sanitisation | 2 |
| InChI convertible | 2 |
| internal steric clash | 1 |

Minimum distance failing while volume overlap passes means the ligand sits
slightly too close to the protein rather than through it. That is what a
co-folding model produces, because it places atoms by learned geometry and
never evaluates a force field.

Every chemistry check and every internal geometry check passes on all but a
handful. Bond lengths, bond angles, aromatic ring flatness, internal energy,
atoms connected, no radicals. The molecules are right. The contacts are tight.

## The first number we computed was wrong

The first run returned 400 of 658, 60.8 percent, with 92 complexes failing
sanitisation and InChI conversion. Those 92 were tautomeric heterocycles and
58 of them failed nothing else.

The cause was in our harness. We wrote the ligand to SDF with kekulisation
turned off, which leaves aromatic bond types in a molblock, and a molblock
cannot carry those, so RDKit refused to sanitise a file we had written badly.
Checked on two of them: the same molecule fails sanitisation one way and
passes every check the other.

The 60.8 percent is retracted. It understated our own poses, which is the
direction that is hardest to catch, and the first report is kept at
`posebusters-unkekulised.json`.

## Relaxation takes it to 98.5 percent

A restrained minimisation in the force field we already use for dynamics fixes
the contacts. The protein backbone is held at 10 kcal/mol/A^2 so the fold
cannot move and only the contacts settle.

Run across all 190 failing poses the force field can parameterise:

| | complexes | share |
|---|---|---|
| pass before relaxation | 462 of 658 | 70.2% |
| fixed by relaxation | 186 of 190 | |
| **pass after relaxation** | **648 of 658** | **98.5%** |

Two poses still fail, one on an internal steric clash and one on double bond
flatness, and two errored during the build. Six complexes were never attempted
because they contain boron, which no public small molecule force field covers,
and our builder refuses those rather than guessing at them.

This is now a step in the pipeline rather than an experiment. Any pose we hand
somebody is relaxed first.

The affinity is not recomputed. It was predicted from the pose the model
produced and that number does not move. What changes is the structure somebody
opens.

## What this does not show

Pose accuracy. PoseBusters says a structure is physically possible, not that it
is right. Knowing whether our poses are correct needs crystal structures to
compare against, and for 28 proteins with 658 complexes we do not have them.
A method can produce a perfectly valid pose in the wrong place.
