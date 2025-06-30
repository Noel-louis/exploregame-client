import SubmitQuestion from "@/components/SubmitQuestion/SubmitQuestion";
import { Form } from "@/components/ui/form";
import { useColorsDepartments } from "@/context/ColorsDepartmentContext";
import { useCurrentQuestionState } from "@/context/CurrentQuestionStateContext";
import { Maybe, Question } from "@exploregame/types"
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleDot, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Answer {
  __typename: string
  id: string
  answer: string
}

const formSchema = z.object({
  answers: z.array(z.string()).min(2, {
    message: 'La réponse est requise',
  }),
})

const QuestionMultiple = ({
  question,
  checkAnswer,
  next,
}: {
  question: Question
  checkAnswer: (answers: string[]) => void
  next: () => void
}) => {
  const { questionState } = useCurrentQuestionState()
  const { getColors } = useColorsDepartments()
  const { primary, secondary } = getColors()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: [],
    },
  })

  async function submit(data: z.infer<typeof formSchema>) {
    try {
      !questionState.answered ? checkAnswer(data.answers) : next()
    } catch (err) {
      console.error("Erreur de connexion:", err)
    }
  }

  const answers: Maybe<Answer[]> = question.Answer as Maybe<Answer[]>
  if (!answers) return null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <div className="flex flex-col h-[80vh]"> {/* Hauteur totale de la zone question+réponses+footer */}
          <div className="flex-1 overflow-auto px-4 pb-24"> {/* pb-24 = padding bas pour le bouton */}
            <section className="grid gap-y-2">
              <label className="break-words whitespace-pre-line text-2xl font-bold text-gray-500 w-full text-center my-4">
                {question.question}
              </label>
              <div className="flex items-center gap-x-1 text-muted-foreground">
                <Info />
                <p>Réponses multiples</p>
              </div>
              {answers.map((answer, index) => {
                let buttonStyle = {}
                if (questionState.answered) {
                  if (questionState.answers.includes(answer.answer)) {
                    buttonStyle = { backgroundColor: '#46E54E', color: '#fff', borderColor: '#46E54E' }
                  } else if (questionState.userAnswers.includes(answer.answer)) {
                    buttonStyle = { backgroundColor: '#C53030', color: '#fff', borderColor: '#C53030' }
                  }
                } else {
                  buttonStyle = form.watch("answers").includes(answer.answer) 
                    ? { backgroundColor: secondary, color: primary, borderColor: primary } 
                    : {}
                }

                return (
                  <button
                    key={index}
                    disabled={questionState.answered}
                    type="button"
                    className='w-full bg-gray-100 text-gray-400 border-gray-200 p-4 border-4 rounded-3xl font-bold text-2xl flex justify-center items-center'
                    style={buttonStyle}
                    onClick={() => {
                      const currentAnswers = form.watch("answers")
                      if (currentAnswers.includes(answer.answer)) {
                        form.setValue("answers", currentAnswers.filter((a) => a !== answer.answer))
                      } else {
                        form.setValue("answers", [...currentAnswers, answer.answer])
                      }
                    }}
                  >
                    {form.watch('answers').includes(answer.answer) && <CircleDot size={32} className={`text-[${primary}]`} />}
                    <p className="w-full">
                      {answer.answer}
                    </p>
                  </button>
                )
              })}
            </section>
          </div>
          <div className="fixed bottom-0 left-0 right-0 bg-white z-10 py-4 shadow">
            <SubmitQuestion />
          </div>
        </div>
      </form>
    </Form>
  )
}

export default QuestionMultiple