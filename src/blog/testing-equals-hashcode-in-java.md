---

title: testing equals and hashcode in java
draft: true
tags:
- java
- testing

---

```java
    @Test
    public void equals() {
        // Given
        DelayNodeParametersDto x = new DelayNodeParametersDto(DURATION_SECONDS, DURATION_UNIT);
        DelayNodeParametersDto y = new DelayNodeParametersDto(DURATION_SECONDS, DURATION_UNIT);
        DelayNodeParametersDto z = new DelayNodeParametersDto(DURATION_SECONDS, DURATION_UNIT);

        // Then reflexive equality
        assertTrue(x.equals(x));

        // And symmetric equality
        assertTrue(x.equals(y));
        assertTrue(y.equals(x));

        // And transitive equality
        assertTrue(y.equals(z));
        assertTrue(x.equals(z));

        // And consistent equality
        assertTrue(x.equals(y));
        assertTrue(x.equals(y));
        assertTrue(x.equals(y));
    }

    @Test
    public void notEquals() {
        // Given
        DelayNodeParametersDto x = new DelayNodeParametersDto(60L, DURATION_UNIT);
        DelayNodeParametersDto y = new DelayNodeParametersDto(120L, DURATION_UNIT);

        // Then non-nullity
        assertFalse(x.equals(null));

        // And
        assertFalse(x.equals(y));
        assertFalse(y.equals(x));
    }

    @Test
    public void hashCode_equals() {
        // Given
        DelayNodeParametersDto x = new DelayNodeParametersDto(120L, DURATION_UNIT);
        DelayNodeParametersDto y = new DelayNodeParametersDto(120L, DURATION_UNIT);

        // When
        int hashCodeOfX = x.hashCode();
        int hashCodeOfY = y.hashCode();

        // Then
        assertEquals(hashCodeOfX, hashCodeOfY);
    }
```

```java
    @Test
    public void interfaces() {
        // Given
        ExecuteExternalApiProcedure apiProcedure = new ExecuteExternalApiProcedure();

        // Then
        assertThat(apiProcedure).isInstanceOf(ProtoSerializable.class);
    }

    @Test
    public void objectHierarchy() {
        // Then
        assertThat(operator).isInstanceOf(ActionOperator.class);
        assertThat(operator).isInstanceOf(Operator.class);
    }

    @Test
    public void getters_asConstructed() {
        // When
        long id = operator.getId();
        long timeoutSeconds = operator.getTimeoutSeconds();
        String simpleName = operator.getSimpleName();

        // Then
        assertThat(id).isEqualTo(ID);
        assertThat(timeoutSeconds).isEqualTo(TIMEOUT_SECONDS);
        assertThat(simpleName).isNotEmpty();
    }

    @Test
    public void getters_asSet() {
        // Given
        ExecuteExternalApiProcedure expectedApiProcedure = createExecuteExternalApiProcedure();
        operator.setExecuteExternalApiProcedure(expectedApiProcedure);

        // When
        ExecuteExternalApiProcedure apiProcedure = operator.getExecuteExternalApiProcedure();

        // Then
        assertThat(apiProcedure).isEqualTo(expectedApiProcedure);
    }

    @Test
    public void toProto_fromProto() {
        // Given
        operator.setExecuteExternalApiProcedure(createExecuteExternalApiProcedure());

        // When
        FlowDefinitionOperatorProtos.Operator proto = operator.toProto();
        ExecuteExternalApiProcedureActionOperator unmarshalled =
                ExecuteExternalApiProcedureActionOperator.fromProto(proto);

        // Then
        assertThat(unmarshalled.getId()).isEqualTo(operator.getId());
        assertThat(unmarshalled.getTimeoutSeconds()).isEqualTo(operator.getTimeoutSeconds());

        // And
        assertThat(unmarshalled).isEqualTo(operator);
    }
```
