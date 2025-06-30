import SubmitQuestion from "@/components/SubmitQuestion/SubmitQuestion";
import { Form } from "@/components/ui/form";
import { useColorsDepartments } from "@/context/ColorsDepartmentContext";
import { useCurrentQuestionState } from "@/context/CurrentQuestionStateContext";
import { Maybe, Question } from "@exploregame/types"
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleDot } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Answer {
  __typename: string
  id: string
  answer: string
}

const formSchema = z.object({
  answer: z.string().min(1, {
    message: 'La réponse est requise',
  }),
})

const QuestionRadioField = ({
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
  })

  const { answered, userAnswers, answers: realAnswers } = questionState

  async function submit(data: z.infer<typeof formSchema>) {
    const answer = [data.answer]
    try {
      !answered ? checkAnswer(answer) : next()
    } catch (err) {
      console.error("Erreur de connexion:", err)
    }
  }

  const answers: Maybe<Answer[]> = question.Answer as Maybe<Answer[]>
  if (!answers) return

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <div className="flex flex-col h-[80vh]"> {/* Hauteur totale de la zone question+réponses+footer */}
          <div className="flex-1 overflow-auto px-4 pb-24"> {/* padding horizontal ici */}
            <section className="grid gap-y-2"> {/* plus de mx-8 ni w-full */}
              <label className="break-words whitespace-pre-line text-2xl font-bold text-gray-500 w-full text-center my-4">
                {question.question}
              </label>
              {answers.map((answer, index) => {
                let buttonStyle = {}
                if (answered) {
                  if (realAnswers.includes(answer.answer)) {
                    buttonStyle = { backgroundColor: '#46E54E', color: '#fff', borderColor: '#46E54E' }
                  } else if (userAnswers.includes(answer.answer)) {
                    buttonStyle = { backgroundColor: '#C53030', color: '#fff', borderColor: '#C53030' }
                  }
                } else {
                  buttonStyle = form.watch("answer") === answer.answer 
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
                      if (form.watch("answer") === answer.answer) {
                        form.setValue("answer", "")
                        return
                      }
                      form.setValue("answer", answer.answer)
                    }}
                  >
                    {form.watch('answer') === answer.answer && <CircleDot size={32} className={`text-[${primary}]`} />}
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

export default QuestionRadioField;