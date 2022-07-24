import React, { useState, useEffect } from 'react';
import apiURL from '../../../../axios/axiosConfig';
import { Form, message, Divider } from 'antd';

import InputTags from '../../InputTags';
import Historial from '../../../commons/Historial';
import Supplements from './components/molecules/Supplements';
import { isEmptyObject, isEmptyString } from '../../../../utils';

const Background = ({ id }) => {
    const [form] = Form.useForm();
    const [familiares, setFamiliares] = useState([]);
    const [patologicos, setPatologicos] = useState([]);
    const [medicamentos, setMedicamentos] = useState([]);
    const [suplementos, setSuplementos] = useState([]);

    const handleRemovePatologicos = (tag) => {
        const newState = patologicos.filter((item) => {
            const normalizedItem = item.toLowerCase().trim();
            const normalizedTag = tag.toLowerCase().trim();

            if (isEmptyString(normalizedItem)) return false;

            return normalizedItem !== normalizedTag;
        });

        setPatologicos(newState);
    };

    const handleRemoveMedicamentos = (tag) => {
        const newState = medicamentos.filter((item) => {
            const normalizedItem = item.toLowerCase().trim();
            const normalizedTag = tag.toLowerCase().trim();

            if (isEmptyString(normalizedItem)) return false;

            return normalizedItem !== normalizedTag;
        });

        setMedicamentos(newState);
    };

    const fetchData = async () => {
        try {
            const { data, status } = await apiURL.get(
                `historialClinico/individual?usuario=${id}`
            );

            if (!isEmptyObject(data)) {
                const { historiaClinica } = data;
                const {
                    antecedentesHeredoFamiliares,
                    antecedentesPatologicos,
                    medicamentos,
                    suplementos,
                } = historiaClinica;

                setFamiliares(antecedentesHeredoFamiliares);
                setPatologicos(antecedentesPatologicos);
                setMedicamentos(medicamentos);
                setSuplementos(suplementos);
            }
        } catch (error) {
            console.groupCollapsed('Error en la función antecedentes clínicos');
            console.error(error);
            console.groupEnd();
        }
    };

    const onFinish = async (values) => {};

    useEffect(() => {
        fetchData();

        // return () => {
        //     setBioquimicosDates({});
        // };
    }, [id]);

    return (
        <div className='basicContainer'>
            <div className='containData'>
                <h2>Antecedentes patológicos</h2>
                <Form
                    scrollToFirstError
                    form={form}
                    requiredMark={false}
                    layout='vertical'
                    onFinish={onFinish}>
                    <div className='basicInfo-ContainerSocioData'>
                        <div className='entradasSocioData'>
                            <Form.Item label='Heredo-Familiares' name='familiares'>
                                <Historial source={familiares} updateSource={setFamiliares} />
                            </Form.Item>
                        </div>
                        <Divider />
                        <div className='entradasSocioData'>
                            <Form.Item label='Patológicos' name='patologicos'>
                                <InputTags
                                    source={patologicos}
                                    onUpdateOptions={setPatologicos}
                                    onRemoveTag={handleRemovePatologicos}
                                />
                            </Form.Item>
                        </div>
                    </div>
                    <div className='basicInfo-ContainerSocioData'>
                        <div className='entradasSocioData'>
                            <Form.Item label='Medicamentos' name='medicamentos'>
                                <InputTags
                                    source={medicamentos}
                                    onUpdateOptions={setMedicamentos}
                                    onRemoveTag={handleRemoveMedicamentos}
                                />
                            </Form.Item>
                        </div>
                    </div>
                    <Divider />
                    <div className='basicInfo-ContainerSocioData'>
                        <div className='entradasSocioData'>
                            <Form.Item label='Suplementos' name='suplementos'>
                                <Supplements
                                    source={suplementos}
                                    updateSource={setSuplementos}
                                />
                            </Form.Item>
                        </div>
                    </div>
                    <center>
                        <button
                            className='btn-see-circunferencia'
                            htmlType='submit'
                            value='Add'>
                            Guardar
                        </button>
                    </center>
                </Form>
            </div>
        </div>
    );
};

export default Background;