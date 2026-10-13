> **The extreme-pair control failed, 2026-10-13, so the full experiment does
> not run.** On the angiotensin II type 1 receptor, the pose whose affinity was
> wrong by 2,885 fold came back MORE stable than the pose that was right: RMSD
> 2.43 against 3.53 angstroms, contact persistence 0.290 against 0.152. Both
> metrics point the wrong way, and the 1.11 angstrom difference between the
> poses is smaller than the 4.24 angstrom scatter across five replicas of the
> same pose, so it is noise as well as backwards. The registration required
> this pair to separate in the predicted direction before the 160 pose
> subsample ran. It did not. Results and what was learned are in
> `benchmarks/results/control-pose-stability-failed.json`.

# Pre-registration v2: pose stability, redesigned after reading the literature

Supersedes 2026-10-09-pose-stability.md, which is kept unchanged. Written
2026-10-12, after a multi-agent audit checked that plan against published
protocols and found it diverges from every comparable one in five ways. None of
the divergences were deliberate. They are what happens when a protocol is
designed from first principles without reading how the field does it, which is
exactly the mistake the project owner asked to avoid.

## What the audit found, and why v1 had to be replaced

**One trajectory per pose.** Every published protocol that scores poses by
molecular dynamics averages over 3 to 25 independent replicas started from the
same structure with different velocities. A single trajectory cannot separate a
pose that is unstable from a pose that happened to get an unlucky set of
starting velocities.

**Five nanoseconds.** v1 noted this was short and treated the risk vaguely. The
literature names a sharper problem than "a pose can be wrong in a way that
takes longer to show": at this length the measurement is dominated by the
initial relaxation out of a predicted geometry rather than by the stability of
the binding mode.

**Restraining the protein backbone through production.** This appears in no
published pose-stability protocol. Restraints are used to settle a system and
released before anything is measured. Holding them suppresses the very motion
that distinguishes a held pose from a drifting one, because a ligand cannot be
expelled from a pocket that cannot open.

**Ligand RMSD as the only metric.** Published practice pairs it with contact
persistence, because RMSD misses the failure that matters most: a ligand that
keeps its position while losing every specific interaction.

**The endpoint.** This is the finding that matters most and it is a reason for
doubt rather than a protocol fix. Every published validation of pose stability
is against pose correctness, measured as agreement with a crystal structure.
Our hypothesis is about affinity error, which is a different quantity, and the
one published measurement of RMSD against affinity error is near-null. So there
is already evidence in the literature that this will not work.

## What this registration therefore commits to

Not a better version of the same hypothesis. A protocol that matches published
practice, run on a design that tells us something either way, with the prior
stated honestly.

**Hypothesis, unchanged in direction and weakened in confidence.** Ligand
instability under unrestrained dynamics in explicit solvent is positively
associated with absolute log error of the affinity read off that pose. Prior
expectation: null, because the closest published measurement is near-null. This
is registered as a test worth running precisely because a null is informative
and the cost is now small.

**Protocol, matched to published practice.**
- Equilibrate with position restraints on protein heavy atoms, then release
  them. Nothing is measured while restraints are on.
- Equilibrate binding-site water before production. A co-folded pose carries no
  waters, so every pocket water is placed by the solvation step and has to find
  its own position first.
- Production is unrestrained.
- 5 independent replicas per pose, differing only in starting velocities.
- 2 ns per replica, which is 10 ns of sampling per pose against v1's 5, while
  each individual run is short enough to be a work unit.

**Two metrics, not one.**
1. Ligand heavy-atom RMSD from the starting pose, after removing periodic
   wrapping and aligning on the protein backbone. Both steps are stated because
   v1 specified neither and a wrapped ligand produces a large, plausible,
   meaningless RMSD.
2. Contact persistence: the fraction of protein-ligand heavy-atom contacts
   within 4 angstroms present in the starting pose that survive the final
   quarter of the trajectory.

Per pose, each metric is the median across the 5 replicas, and the spread
across replicas is reported alongside, because that spread is what tells us
whether one trajectory would have been enough.

**Statistic and decision rule.** Unchanged from v1, applied to both metrics
separately with a Bonferroni correction for testing two: within-target Spearman
against absolute log error, averaged over targets, bootstrap interval over
targets. Adopt as a triage signal only if the mean is at least +0.30 and the
99 percent interval excludes zero. Report a null if it does not.

## Why this also serves Part B

v1's single long trajectory per pose had no natural work-unit boundary. Five
independent 2 ns replicas is the established way to distribute molecular
dynamics across unreliable machines: many short independent runs from the same
starting state, results aggregated, a lost run costing one replica rather than
a pose. That is the Folding@home shape, and it means the distributed layer and
this experiment are the same piece of work rather than competing for the same
card.

## Cost, measured rather than assumed

v1 assumed 150 ns/day and was wrong; the measured figure on a 76,000 atom
protein-ligand box is 99 ns/day. 10 ns per pose is 2.4 GPU hours. The
stratified subsample stays at 160 poses, 8 targets by 20 poses chosen by error
rank, which is 16 GPU days of work split into 800 independent 2 ns units.

That is more total compute than v1 and it is divisible, which v1 was not. The
negative controls from v1 carry over unchanged: scrambled labels, a
highest-against-lowest error pair at double length, and a check that the
protein actually stayed put during equilibration and actually moved during
production.

## What has no implementation yet

Everything in the metrics section. There is no RMSD code, no contact code, no
restraint force and no replica runner anywhere in this repository, and run_nvt
cannot even accept the system that carries the ligand parameters. v1 was
registered as though the protocol existed. This registration is explicit that
it does not, and no result may be reported against it until the negative
controls above pass.
