# How far the structure moves when we relax it

Measured 16 October 2026 on the 188 complexes where the structure before and
after relaxation are both on disk. No new prediction and no GPU. The numbers
are in `benchmarks/results/relaxation-displacement.json`.

## Why this had to be measured first

Relaxation takes our predicted complexes from 70.2 percent PoseBusters valid
to 98.5 percent. The first question anybody sensible asks is whether we passed
the check by moving the ligand somewhere else, and until today we had not
measured it.

## The fold does not move

Protein backbone RMSD, over atoms matched on chain, residue number and atom
name, with no superposition applied because both structures sit in the same
frame:

**Median 0.100 angstroms. Ninetieth percentile 0.114. The worst case across
188 complexes is 0.144.**

The backbone restraint holds at 10 kcal/mol per square angstrom and it does
what it was set to do. Nothing in the fold is being traded for a passing
check.

## The ligand moves, by less than the field's own threshold for correct

Ligand heavy atom RMSD:

**Median 0.847 angstroms. Ninetieth percentile 1.231. The largest across 188
complexes is 1.882.**

One hundred and thirty two of 188 move less than 1.0 angstrom. Five move less
than 0.5. None moves more than 1.9. The largest single atom displacement in
any complex is 4.58 angstroms and the median largest displacement is 1.619.

The convention in this field is that a predicted pose counts as correct when
it sits within 2.0 angstroms of the crystal. Every relaxation we have run
moves the ligand less than that threshold, so no pose is displaced further
than the distance the field treats as the line between right and wrong.

## What this does not establish

Whether the relaxed pose is **closer to the truth** than the one it replaced.

Moving a ligand 0.85 angstroms from a predicted pose tells you the relaxation
was gentle. It does not tell you which of the two is nearer the crystal
structure, because our 123 corpus proteins were folded from sequence and we
have no crystal structure of those complexes to measure against. A relaxation
that fixes a steric clash is physically better by construction. A relaxation
that moves the ligand toward the experimental pose is better in the way a
customer cares about, and the two are not the same claim.

So the honest statement today is narrow. The relaxation makes a predicted
complex physically valid, at a cost of 0.85 angstroms of ligand movement and
0.1 angstroms of backbone movement, in 18 seconds.

## The experiment that settles it

The PoseBusters benchmark holds several hundred recent Protein Data Bank
complexes with both the crystal ligand and the coordinates a method predicted.
Running our relaxation on predicted poses from that set, where the crystal
answer exists, measures the thing this cannot: whether ligand RMSD to the
crystal goes down, stays level or goes up.

That is the next experiment and it needs no laboratory, no new hardware and no
affinity model. It is registered separately before it runs.

## Files

- `benchmarks/results/relaxation-displacement.json`, per complex and in
  aggregate.
- `scripts/relaxation_displacement.py`, the measurement.
- `benchmarks/results/2026-10-16-posebusters.md`, the validity result this
  supports.
