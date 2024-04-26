
# TODO: this is a mockup of an actual database for now



_rag_docs = {
    "Bloom's Taxonomy": """Bloom's taxonomy is a set of three hierarchical models used for classification of 
    educational learning objectives into levels of complexity and specificity. The three lists cover the 
    learning objectives in cognitive, affective and psychomotor domains. The cognitive domain list has been 
    the primary focus of most traditional education and is frequently used to structure curriculum learning 
    objectives, assessments and activities.

The models were named after Benjamin Bloom, who chaired the committee of educators that devised the taxonomy. He also 
edited the first volume of the standard text, Taxonomy of Educational Objectives: The Classification of Educational 
Goals.[1][2]

History The publication of Taxonomy of Educational Objectives followed a series of conferences from 1949 to 1953, 
which were designed to improve communication between educators on the design of curricula and examinations.[3]

The first volume of the taxonomy, Handbook I: Cognitive[1] was published in 1956, and in 1964 the second volume 
Handbook II: Affective was published.[4][5][6][7][8] A revised version of the taxonomy for the cognitive domain was 
created in 2001.[9]

Cognitive domain (knowledge-based)

Bloom's Taxonomy In the 1956 original version of the taxonomy, the cognitive domain is broken into the six levels of 
objectives listed below.[10] In the 2001 revised edition of Bloom's taxonomy, the levels have slightly different 
names and their order is revised: Remember, Understand, Apply, Analyze, Evaluate, and Create (rather than 
Synthesize).[9][11]

1956 cognitive domain levels[10] Level	Description	Example Knowledge	Knowledge involves recognizing or remembering 
facts, terms, basic concepts, or answers without necessarily understanding what they mean. Some characteristics may 
include: Knowledge of specifics—terminology, specific facts Knowledge of ways and means of dealing with 
specifics—conventions, trends and sequences, classifications and categories Knowledge of the universals and 
abstractions in a field—principles and generalizations, theories and structures Name three common varieties of apple. 
Comprehension	Comprehension involves demonstrating an understanding of facts and ideas by organizing, summarizing, 
translating, generalizing, giving descriptions, and stating the main ideas.	Summarize the identifying characteristics 
of a Golden Delicious apple and a Granny Smith apple. Application	Application involves using acquired knowledge to 
solve problems in new situations. This involves applying acquired knowledge, facts, techniques and rules. Learners 
should be able to use prior knowledge to solve problems, identify connections and relationships and how they apply in 
new situations.	Would apples prevent scurvy, a disease caused by a deficiency in vitamin C? Analysis	Analysis 
involves examining and breaking information into component parts, determining how the parts relate to one another, 
identifying motives or causes, making inferences, and finding evidence to support generalizations. Its characteristics 
include: Analysis of elements Analysis of relationships Analysis of organization Compare and contrast four ways of 
serving foods made with apples and examine which ones have the highest health benefits. Synthesis	Synthesis involves 
building a structure or pattern from diverse elements; it also refers to the act of putting parts together to form a 
whole or bringing pieces of information together to form a new meaning. Its characteristics include: Production of a 
unique communication Production of a plan, or proposed set of operations Derivation of a set of abstract relations 
Convert an "unhealthy" recipe for apple pie to a "healthy" recipe by replacing your choice of ingredients. Argue for 
the health benefits of using the ingredients you chose versus the original ones. Evaluation	Evaluation involves 
presenting and defending opinions by making judgments about information, the validity of ideas, or quality of work 
based on a set of criteria. Its characteristics include: Judgments in terms of internal evidence Judgments in terms 
of external criteria Which kinds of apples are suitable for baking a pie, and why?""",

}


def get_rag_doc(name: str) -> str:
    return _rag_docs[name]


def get_rag_docs() -> list[str]:
    return list(_rag_docs.keys())
