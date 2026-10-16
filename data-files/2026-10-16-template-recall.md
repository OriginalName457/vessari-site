# Does the ranking hold on proteins nobody has crystallised

Run 16 October 2026. Numbers in `benchmarks/results/template-recall.json`,
reproduce with `scripts/template_recall.py`.

## The question

The folding model trains on the Protein Data Bank. If it ranks compounds well
only where a structure already exists, it is doing retrieval with extra steps,
and our headline says nothing about a protein nobody has solved. A reviewer
asked us this and we had not measured it.

## What we measured

Twenty one of the 123 proteins we score have no solved structure at all. We
compared them against the 37 proteins with twenty or more.

| solved structures | proteins | median rank correlation | above 0.5 | below zero |
|---|---|---|---|---|
| **none** | 21 | **0.553** | 15 | **0** |
| 1 to 4 | 28 | 0.590 | 17 | 4 |
| 5 to 19 | 37 | 0.604 | 26 | 1 |
| 20 or more | 37 | 0.648 | 22 | 2 |

The difference between no structure and twenty or more is minus 0.095, with a
95 percent interval of minus 0.196 to plus 0.221. That interval contains zero.

## What it says

The method does not collapse on proteins nobody has crystallised. Fifteen of
the twenty one score above 0.5, none scores below zero, and the gap to well
solved proteins is not separable from noise at this sample size.

There is a gradient across the table, from 0.553 to 0.648, and we are not
calling it an effect. The interval covers it. A larger corpus might resolve a
real advantage for proteins the model has seen, and we would expect one, since
a solved structure in training is information the model can use.

## The limit, and it is a real one

Having no structure of your own is not the same as having no close relative in
the training data. A protein with no entry can sit beside a homologue the model
knows well, and that homologue carries most of the same fold.

The test that separates those is a sequence identity search against the
training set with a date cutoff, asking how similar the nearest known structure
is rather than whether this exact protein appears. We have not run it. So this
measurement rules out a collapse and cannot rule out a milder effect running
through homology.

That matters most for the receptors. Fifty six of the 123 proteins are G
protein coupled receptors, the Protein Data Bank holds hundreds of class A
receptors, and the orthosteric pocket is similar across the aminergic family.
A receptor with no structure of its own still has well solved cousins.

## Why it matters commercially

A customer with a protein nobody has solved is the case where a structure
prediction earns its cost. This says the ranking still works there. It does not
say the method ignores the Protein Data Bank, and nobody should read it that
way.
