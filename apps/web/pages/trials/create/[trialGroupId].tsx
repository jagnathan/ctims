import { useRouter } from 'next/router';
import useGetCtmlSchema from '../../../hooks/useGetCtmlSchema';
import {signOut, useSession} from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import EditorTopBar from '../../../components/editor/EditorTopBar';
import LeftMenuEditorComponent from '../../../components/editor/LeftMenuEditorComponent';
import { Ui } from '@ctims-mono-repo/ui';
import IdleComponent from "../../../components/IdleComponent";
import FooterComponent from 'apps/web/components/FooterComponent';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, store} from 'apps/web/store/store';
import process from "process";
import {logout} from "../../api/auth/[...nextauth]";
import {selectedTrialGroupId} from "../../../store/slices/contextSlice";

const EditorCreateCtmlForGroup = () => {
  const router = useRouter()
  const { trialGroupId } = router.query
  const { error, response, loading, operation} = useGetCtmlSchema();
  const [lastSaved, setLastSaved] = useState<string>("Unsaved");
  const trialId = useSelector((state: RootState) => state.context.trialNctId);
  const [formData, setFormData] = useState(null);

  const dispatch = useDispatch();

  const {data} = useSession()

  if (trialGroupId) {
    // re-establish selected trial group in case of a browser refresh
    dispatch(selectedTrialGroupId(trialGroupId as string));
  }

  useEffect(() => {
    operation();
    let createTrialObject = {
      trialInformation: {
        trial_id: trialId,
        trial_internal_id: uuidv4(),
      },
      drug_list: {
        drug: [
          {}
        ]
      },
      management_group_list: {
        management_group: [
          {}
        ]
      },
      site_list: {
        site: [
          {}
        ]
      },
      sponsor_list: {
        sponsor: [
          {}
        ]
      },
      staff_list: {
        protocol_staff: [
          {}
        ]
      },
      treatment_list: {
        step: [
            {
                arm: [
                    {
                        dose_level: [
                            {}
                        ],
                        match: {}
                    }
                ]
            }
        ]
      },
    }
    setFormData(createTrialObject)
  }, [])

  useEffect(() => {
    if(!data) {
      // no need to sign out, as server side rendering will have data = null, but client side render will have user data
      // router.push('/');
      // signOut({redirect: false}).then(() => {
      //   store.dispatch(logout());
      //   router.push(process.env.NEXT_PUBLIC_SIGNOUT_REDIRECT_URL as string || '/');
      // });
    }
  }, [data])

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: '80px',
    paddingRight: '80px',
    paddingTop: '20px',
  }


  return (
    <>
      <EditorTopBar lastSaved={lastSaved} setLastSaved={setLastSaved}/>
      <IdleComponent />
      <div style={containerStyle}>
        <LeftMenuEditorComponent />
        {response && <Ui ctml_schema={response} formData={formData} setLastSaved={setLastSaved}></Ui>}
      </div>
      <FooterComponent/>
    </>
  )
}
export default EditorCreateCtmlForGroup;
